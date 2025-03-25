import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BookSaleStatus } from '@prisma/client';

export class UpdateBookSaleStatusDtoOut {
  @ApiProperty({ example: 'SOLD' })
  @IsString()
  saleStatus: BookSaleStatus;
}
