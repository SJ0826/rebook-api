import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookStatus } from '@prisma/client';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {
  }

  // 책 생성
  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  // 책 수정
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(Number(id), updateBookDto);
  }

  // 책 삭제
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.booksService.delete(Number(id));
  }

  // 책 검색
  @Get('search')
  async searchBooks(@Query('q') query?: string, @Query('minPrice') minPrice?: number, @Query('maxPrice') maxPrice?: number, @Query('status') status?: BookStatus) {
    return this.booksService.searchBooks(query, { minPrice, maxPrice, status });
  }
}
