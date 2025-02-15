import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FavoritesService, PrismaService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
