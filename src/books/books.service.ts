import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookSaleStatus, BookStatus } from '@prisma/client';
import { UpdateBookSaleStatusDtoOut } from './dto/update-book-sale-status.dto';

@Injectable()
export class BooksService {
  private readonly logger: Logger = new Logger(BooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------
  // 책 등록 (Create)
  // ---------------------
  async create(sellerId: number, createBookDto: CreateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 유효한 사용자 확인
      const seller = await tx.user.findUnique({
        where: { id: sellerId },
      });
      if (!seller) {
        throw new NotFoundException('유효한 사용자 아이디가 아닙니다.');
      }

      // 2. 책 등록
      const { imageUuids, ...bookData } = createBookDto;
      const newBook = await tx.book.create({
        data: { ...bookData, sellerId: sellerId },
      });

      // 3. imageUrl - bookId 연결 (순서 유지)
      const sortValues = imageUuids.map(({ sort }) => sort);
      if (new Set(sortValues).size !== sortValues.length) {
        throw new ConflictException('동일한 sort 값을 가진 이미지가 있습니다.');
      }

      await Promise.all(
        imageUuids.map(async ({ uuid, sort }) => {
          const image = await tx.bookImage.findUnique({ where: { uuid } });

          if (!image) {
            throw new NotFoundException(
              `유효하지 않은 이미지 uuid 입니다. uuid: ${uuid}`,
            );
          }

          await tx.bookImage.update({
            where: { uuid },
            data: { bookId: newBook.id, sort },
          });
        }),
      );

      // 4. bookId에 해당하는 이미지 URL 목록 조회
      const imageUrls = await tx.bookImage.findMany({
        where: { bookId: newBook.id },
        orderBy: { sort: 'asc' },
        select: { imageUrl: true, sort: true },
      });

      return {
        id: newBook.id,
        ...bookData,
        imageUrls: imageUrls.map((img) => {
          return {
            imageUrl: img.imageUrl,
            sort: img.sort,
          };
        }),
      };
    });
  }

  // ---------------------
  // 책 수정 (Update)
  // ---------------------
  async updateBook(id: number, updateBookDto: UpdateBookDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 기존 책 조회
      const existingBook = await tx.book.findUnique({
        where: { id },
      });

      if (!existingBook) {
        throw new NotFoundException('해당 책을 찾을 수 없습니다.');
      }

      // 2. uuids가 제공된 경우에만 기존 이미지 연결 해제 후 새로 연결
      const { imageUuids, ...bookData } = updateBookDto;
      if (imageUuids) {
        // 기존 이미지 연결 해제
        await tx.bookImage.updateMany({
          where: { bookId: id },
          data: { bookId: null }, // 기존 연결 해제
        });

        // 새로운 UUIDs 연결
        await Promise.all(
          imageUuids.map(async ({ uuid, sort }) => {
            const image = await tx.bookImage.findUnique({
              where: { uuid },
            });

            if (!image) {
              throw new NotFoundException(
                `유효하지 않은 이미지 uuid 입니다. uuid: ${uuid}`,
              );
            }

            await tx.bookImage.update({
              where: { uuid },
              data: { bookId: id, sort },
            });
          }),
        );
      }

      // 3. 책 정보 업데이트
      const updatedBook = await this.prisma.book.update({
        where: { id },
        data: { ...bookData },
      });

      // 4. 최신 이미지 목록 반환
      const imageUrls = await this.prisma.bookImage.findMany({
        where: { bookId: id },
        orderBy: { sort: 'asc' },
        select: { imageUrl: true, sort: true },
      });

      return {
        ...updatedBook,
        imageUrls: imageUrls.map((img) => {
          return {
            imageUrl: img.imageUrl,
            sort: img.sort,
          };
        }),
      };
    });
  }

  // ---------------------
  // 책 판매 상태 수정
  // ---------------------
  async updateBookSaleStatus(
    id: number,
    updateBookSaleStatusDtoOut: UpdateBookSaleStatusDtoOut,
  ) {
    const { saleStatus } = updateBookSaleStatusDtoOut;
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    }

    await this.prisma.book.update({
      where: { id },
      data: { saleStatus },
    });

    return;
  }

  /**
   * 책 삭제 (Delete)
   */
  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 기존 책 조회
      const existingBook = await tx.book.findUnique({ where: { id } });
      if (!existingBook) {
        throw new NotFoundException('해당 책을 찾을 수 없습니다.');
      }

      // 2. 연결된 이미지 삭제
      await tx.bookImage.deleteMany({ where: { bookId: id } });

      // 3. 책 삭제
      return tx.book.delete({ where: { id } });
    });
  }

  // -----------------------------------
  // 책 검색 (Search) + 페이지네이션
  // -----------------------------------
  async searchBooks(
    query?: string,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      status?: BookStatus;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ) {
    let orderBy;

    switch (filters?.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const page = Number(filters?.page) || 1;
    const limit = Number(filters?.limit) || 8;
    const skip = (page - 1) * limit;

    const [books, totalCount] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where: {
          AND: [
            query
              ? {
                  OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { author: { contains: query, mode: 'insensitive' } },
                  ],
                }
              : {},
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            { saleStatus: BookSaleStatus.FOR_SALE },
          ],
        },
        orderBy: orderBy,
        take: limit,
        skip: skip,
        include: {
          bookImage: { select: { imageUrl: true, sort: true } },
          favorites: true,
          orders: true,
        },
      }),
      this.prisma.book.count({
        where: {
          AND: [
            query
              ? {
                  OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { author: { contains: query, mode: 'insensitive' } },
                  ],
                }
              : {},
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            { saleStatus: BookSaleStatus.FOR_SALE },
          ],
        },
      }),
    ]);

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      books: books.map(({ bookImage, favorites, orders, ...book }) => ({
        ...book,
        imageUrls: bookImage.find((image) => image.sort === 0)?.imageUrl,
        favoriteCount: favorites.length,
        orderCount: orders.length,
      })),
    };
  }

  // ----------------------
  // 책 상세 조회
  // ----------------------
  async getBookDetail(bookId: number, userId: number | null) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        seller: {
          select: { id: true, name: true },
        },
        bookImage: {
          select: { imageUrl: true, uuid: true },
        },
        favorites: true,
        orders: true,
      },
    });

    if (!book) {
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    }

    // 좋아요 여부 확인
    let isFavorite = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findFirst({
        where: {
          userId: userId,
          bookId: bookId,
        },
      });
      isFavorite = !!favorite;
    }

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      price: book.price,
      saleStatus: book.saleStatus,
      description: book.description,
      status: book.status,
      seller: {
        id: book.seller.id,
        name: book.seller.name,
      },
      bookImages: book.bookImage.map((img) => {
        return {
          imageUrl: img.imageUrl,
          uuid: img.uuid,
        };
      }),
      isFavorite: isFavorite,
      favoriteCount: book.favorites.length,
      orderCount: book.orders.length,
      createdAt: book.createdAt,
    };
  }
}
