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
  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  /**
   * 책 수정 (Update)
   */
  async update(id: number, updateBookDto: UpdateBookDto) {
    const existingBook = await this.prisma.book.findUnique({ where: { id } });
    if (!existingBook)
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
    });
  }

  /**
   * 책 삭제 (Delete)
   */
  async delete(id: number) {
    const existingBook = await this.prisma.book.findUnique({ where: { id } });
    if (!existingBook)
      throw new NotFoundException('해당 책을 찾을 수 없습니다.');
    return this.prisma.book.delete({ where: { id } });
  }

  /**
   * 책 검색
   */
  async searchBooks(
    query?: string,
    filters?: { minPrice?: number; maxPrice?: number; status?: BookStatus },
  ) {
    return this.prisma.book.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
