import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('favorites')
@ApiTags('찜')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({
    summary: '찜 목록에 책 추가',
    description: '사용자가 특정 책을 찜 목록에 추가합니다.',
  })
  createFavorite(@Req() req, @Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.create(req.user.id, createFavoriteDto);
  }

  @Delete(':bookId')
  @ApiOperation({
    summary: '찜 삭제',
    description: '사용자가 특정 책을 찜 목록에서 제거합니다.',
  })
  remove(@Req() req, @Param('bookId') bookId: string) {
    return this.favoritesService.remove(req.user.id, Number(bookId));
  }
}
