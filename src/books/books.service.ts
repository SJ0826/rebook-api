import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookStatus } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  /**
   * 책 등록 (Create)
   */
  async create(sellerId: bigint, createBookDto: CreateBookDto) {
    // 1. 유효한 사용자 확인
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      throw new NotFoundException('유효한 사용자 아이디가 아닙니다.');
    }

    // 2. 책 등록
    const { uuids, ...bookData } = createBookDto;
    const newBook = await this.prisma.book.create({
      data: { ...bookData, sellerId: sellerId },
    });

    // 3. imageUrl - bookId 연결
    await Promise.all(
      uuids.map(async (uuid) => {
        const image = await this.prisma.bookImage.findUnique({
          where: { uuid: uuid },
        });
        if (!image) {
          throw new NotFoundException(
            `유효하지 않은 이미지 uuid 입니다. uuid: ${uuid}`,
          );
        }

        await this.prisma.bookImage.update({
          where: { uuid },
          data: { bookId: newBook.id },
        });
      }),
    );

    // 4. bookId에 해당하는 이미지 URL 목록 조회
    const imageUrls = await this.prisma.bookImage.findMany({
      where: { bookId: newBook.id },
      select: { imageUrl: true },
    });

    return { ...newBook, imageUrls: imageUrls.map((img) => img.imageUrl) };
  }

  /**
   * 책 수정 (Update)
   */
  async update(id: number, updateBookDto: UpdateBookDto) {
    // 1. 기존 책 조회
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    }

    // 2. uuids가 제공된 경우에만 기존 이미지 연결 해제 후 새로 연결
    if (updateBookDto.uuids) {
      // 기존 이미지 연결 해제
      await this.prisma.bookImage.updateMany({
        where: { bookId: id },
        data: { bookId: null }, // 기존 연결 해제
      });

      // 새로운 UUIDs 연결
      await Promise.all(
        updateBookDto.uuids.map(async (uuid) => {
          const image = await this.prisma.bookImage.findUnique({
            where: { uuid },
          });

          if (!image) {
            throw new NotFoundException(
              `유효하지 않은 이미지 uuid 입니다. uuid: ${uuid}`,
            );
          }

          await this.prisma.bookImage.update({
            where: { uuid },
            data: { bookId: id },
          });
        }),
      );
    }

    // 3. 책 정보 업데이트
    const { uuids, ...updateData } = updateBookDto;
    const updatedBook = await this.prisma.book.update({
      where: { id },
      data: { ...updateData },
    });

    // 4. 최신 이미지 목록 반환
    const imageUrls = await this.prisma.bookImage.findMany({
      where: { bookId: id },
      select: { imageUrl: true },
    });

    return { ...updatedBook, imageUrls: imageUrls.map((img) => img.imageUrl) };
  }

  /**
   * 책 삭제 (Delete)
   */
  async delete(id: number) {
    // 1. 기존 책 조회
    const existingBook = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    }

    // 2. 해당 책과 연결된 이미지 삭제
    await this.prisma.bookImage.deleteMany({ where: { bookId: id } });

    // 3. 책 삭제
    return this.prisma.book.delete({ where: { id } });
  }

  /**
   * 책 검색 (Search)
   */
  async searchBooks(
    query?: string,
    filters?: { minPrice?: number; maxPrice?: number; status?: BookStatus },
  ) {
    // 1. 검색 조건 적용
    const books = await this.prisma.book.findMany({
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
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        BookImage: {
          select: { imageUrl: true }, // 이미지 URL만 가져옴
        },
      },
    });

    // 2. 이미지 URL 배열 변환 후 반환
    return books.map(({ BookImage, ...book }) => ({
      ...book,
      imageUrls: BookImage.map((img) => img.imageUrl), // 이미지 URL 리스트 추가
    }));
  }
}
