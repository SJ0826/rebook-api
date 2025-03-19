import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookStatus } from '@prisma/client';

import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('books')
@ApiTags('책')
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // 책 생성
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 등록',
    description:
      '사용자가 새로운 책을 등록합니다.' +
      '<li>sort 값은 각 이미지의 순서를 나타냅니다.</li> ' +
      '<li>sort의 값이 0인 이미지가 대표사진으로 등록됩니다.</li>',
  })
  createBook(@Body() createBookDto: CreateBookDto, @Req() req) {
    return this.booksService.create(req.user.id, createBookDto);
  }

  // 책 수정
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 수정',
    description:
      '책의 내용을 수정합니다.' +
      ' <li>sort 값은 각 이미지의 순서를 나타냅니다.</li>' +
      '<li>sort의 값이 0인 이미지가 대표사진으로 등록됩니다.</li>',
  })
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(Number(id), updateBookDto);
  }

  // 책 삭제
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 삭제',
    description: '사용자가 책을 삭제합니다.',
  })
  deleteBook(@Param('id') id: string) {
    return this.booksService.delete(Number(id));
  }

  // 책 검색
  @Get('search')
  @ApiOperation({
    summary: '책 검색',
    description: '사용자가 책을 검색합니다.',
  })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiQuery({ name: 'minPrice', required: false, description: '최소 금액' })
  @ApiQuery({ name: 'maxPrice', required: false, description: '최대 금액' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookStatus,
    description: '책 상태',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'price_high', 'price_low'],
    description: '정렬 옵션 (기본값: newest)',
  })
  searchBooks(
    @Query('search') query?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('status') status?: BookStatus,
    @Query('sort') sort?: string,
  ) {
    return this.booksService.searchBooks(query, {
      minPrice,
      maxPrice,
      status,
      sort,
    });
  }
}
