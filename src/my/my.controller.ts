import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MyService } from './my.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileOutDto } from '../auth/dto/user-profile.dto';
import { BookStatus } from '@prisma/client';
import { GetSellingBooksQueryDto } from './dto/get-selling-books.dto';

@Controller('my')
@ApiTags('내 정보')
export class MyController {
  constructor(private readonly myService: MyService) {}

  // 내 정보 조회
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiBearerAuth()
  async getProfile(@Req() req): Promise<UserProfileOutDto> {
    return this.myService.getUserProfile(req.user.id);
  }
  // 내가 판매중인 책 목록 조회
  @Get('books/selling')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '내가 판매중인 책 목록 조회',
    description: '현재 로그인한 사용자가 판매중인 책 목록을 조회합니다.',
  })
  @ApiBearerAuth()
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
  async getSellingBooks(@Req() req, @Query() query: GetSellingBooksQueryDto) {
    return this.myService.getSellingBooks(req.user.id, query);
  }
  // 내가 구매요청한 책 목록 조회
}
