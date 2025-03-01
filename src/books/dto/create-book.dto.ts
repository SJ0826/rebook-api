import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: '해리 포터와 마법사의 돌' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'J.K. 롤링' })
  @IsString()
  author: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsString({ each: true })
  uuids: string[];

  @ApiProperty({ example: '문학수첩' })
  @IsString()
  publisher: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: '해리 포터와 마법사의 돌 설명' })
  @IsOptional()
  @IsString()
  description: string;
}
