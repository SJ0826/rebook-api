import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookStatus } from '@prisma/client';

export class UpdateBookDto {
  @ApiProperty({ example: '해리 포터와 마법사의 돌 수정' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'J.K. 롤링' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    example: [
      { uuid: 'uuid1', sort: 0 },
      { uuid: 'uuid2', sort: 1 },
    ],
  })
  @IsArray()
  imageUuids: { uuid: string; sort: number }[];

  @ApiProperty({ example: '문학수첩' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({ example: 15000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'NEW' })
  @IsString()
  status: BookStatus;

  @ApiProperty({ example: '해리 포터와 마법사의 돌 설명' })
  @IsOptional()
  @IsString()
  description?: string;
}
