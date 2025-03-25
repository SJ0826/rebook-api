import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookSaleStatus, BookStatus } from '@prisma/client';

@Injectable()
export class MyService {
  private readonly logger: Logger = new Logger(MyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 유저 프로필 조회
   */
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  /** 판매중인 책 목록 조회 */
  async getSellingBooks(
    userId: number,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      status?: BookStatus;
      saleStatus?: BookSaleStatus;
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
          sellerId: userId,
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
        orderBy: orderBy,
        take: limit,
        skip: skip,
        include: {
          orders: true,
          favorites: true,
          bookImage: { select: { imageUrl: true, sort: true } },
        },
      }),
      this.prisma.book.count({
        where: {
          sellerId: userId,
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
      }),
    ]);

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      books: books.map(({ bookImage, orders, favorites, ...book }) => ({
        ...book,
        imageUrls: bookImage.find((image) => image.sort === 0)?.imageUrl,
        orderCount: orders.length,
        favoriteCount: favorites.length,
      })),
    };
  }

  /** 판매중인 책 목록 조회 */
  async getBuyingBooks(
    userId: number,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      status?: BookStatus;
      saleStatus?: BookSaleStatus;
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
          orders: { some: { buyerId: userId } },
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
        orderBy: orderBy,
        take: limit,
        skip: skip,
        include: {
          orders: true,
          favorites: true,
          bookImage: { select: { imageUrl: true, sort: true } },
        },
      }),
      this.prisma.book.count({
        where: {
          orders: { some: { buyerId: userId } },
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
      }),
    ]);

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      books: books.map(({ bookImage, orders, favorites, ...book }) => ({
        ...book,
        imageUrls: bookImage.find((image) => image.sort === 0)?.imageUrl,
        orderCount: orders.length,
        favoriteCount: favorites.length,
      })),
    };
  }

  /** 관심 책장(좋아요) 책 목록 조회 */
  async getFavoriteBooks(
    userId: number,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      status?: BookStatus;
      saleStatus?: BookSaleStatus;
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
          favorites: {
            some: { userId: userId },
          },
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
        orderBy: orderBy,
        take: limit,
        skip: skip,
        include: {
          orders: true,
          favorites: true,
          bookImage: { select: { imageUrl: true, sort: true } },
        },
      }),
      this.prisma.book.count({
        where: {
          favorites: {
            some: { userId: userId },
          },
          AND: [
            filters?.minPrice ? { price: { gte: filters.minPrice } } : {},
            filters?.maxPrice ? { price: { lte: filters.maxPrice } } : {},
            filters?.status ? { status: filters.status } : {},
            filters?.saleStatus ? { saleStatus: filters.saleStatus } : {},
          ],
        },
      }),
    ]);

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      books: books.map(({ bookImage, orders, favorites, ...book }) => ({
        ...book,
        imageUrls: bookImage.find((image) => image.sort === 0)?.imageUrl,
        orderCount: orders.length,
        favoriteCount: favorites.length,
      })),
    };
  }
}
