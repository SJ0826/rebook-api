import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  // -------------------
  // 책 찜하기
  // -------------------
  async create(userId: number, createFavoriteDto: CreateFavoriteDto) {
    const { bookId } = createFavoriteDto;
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: { userId, bookId },
    });
    if (existingFavorite) {
      throw new ConflictException('이미 찜한 책입니다');
    }

    return this.prisma.favorite.create({
      data: { userId, bookId },
    });
  }

  // ----------------------
  // 찜한 책 목록 조회
  // ----------------------
  async findAll(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { book: true },
    });
  }

  // ----------------------
  // 찜 해제
  // ----------------------
  async remove(userId: number, bookId: number) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { userId, bookId },
    });

    if (!favorite) {
      throw new NotFoundException('찜한 책이 없습니다');
    }

    return this.prisma.favorite.delete({ where: { id: favorite.id } });
  }
}
