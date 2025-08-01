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
import { OptionalJwtAuthGuard } from '../auth/optiona-jwt-guard';
import { UpdateBookSaleStatusDtoOut } from './dto/update-book-sale-status.dto';

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
    return this.booksService.updateBook(Number(id), updateBookDto);
  }

  // 책 판매 상태 수정
  @Patch('/:id/sale-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '책 판매 상태 수정',
    description: '책의 판매 상태를 수정합니다.',
  })
  updateBookSaleStatus(
    @Param('id') id: string,
    @Body() updateBookSaleStateDtoOut: UpdateBookSaleStatusDtoOut,
  ) {
    return this.booksService.updateBookSaleStatus(
      Number(id),
      updateBookSaleStateDtoOut,
    );
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
    isArray: true,
    enum: BookStatus,
    description: '책 상태',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['newest', 'oldest', 'price_high', 'price_low'],
    description: '정렬 옵션 (기본값: newest)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '한 페이지에 보여줄 개수 (기본값: 8)',
  })
  searchBooks(
    @Query('searchQuery') searchQuery?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('status') status?: BookStatus[],
    @Query('sort') sort?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 8,
  ) {
    // status를 항상 배열로 반환
    let normalizedStatus: BookStatus[] | undefined;
    if (status) {
      normalizedStatus = Array.isArray(status) ? status : [status];
    }

    return this.booksService.searchBooks(searchQuery, {
      minPrice,
      maxPrice,
      status: normalizedStatus,
      sort,
      page,
      limit,
    });
  }

  // 책 상세 조회
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: '책 상세 조회',
    description:
      '책 ID를 이용하여 특정 책의 상세 정보를 가져옵니다.' +
      'bookImages의 첫번째 이미지는 대표사진입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '책 상세 정보 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '책을 찾을 수 없음',
  })
  getBookDetail(@Param('id') id: number, @Req() req) {
    console.log(req.user);
    const userId = req.user?.id;
    return this.booksService.getBookDetail(id, userId);
  }
}
