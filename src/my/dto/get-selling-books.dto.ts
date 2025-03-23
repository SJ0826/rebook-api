import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookSaleStatus, BookStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetSellingBooksQueryDto {
  @ApiPropertyOptional({ description: '최소 금액', example: 8000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: '최대 금액', example: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: '책 상태', enum: BookStatus })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({ description: '판매 상태', enum: BookSaleStatus })
  @IsOptional()
  @IsEnum(BookSaleStatus)
  saleStatus?: BookSaleStatus;

  @ApiPropertyOptional({
    description: '정렬 옵션',
    enum: ['newest', 'oldest', 'price_high', 'price_low'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  limit?: number;
}
