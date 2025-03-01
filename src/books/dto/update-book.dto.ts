import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty({ example: '해리 포터와 마법사의 돌 수정' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'J.K. 롤링' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  uuids: string[];

  @ApiProperty({ example: '문학수첩' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({ example: 15000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: '해리 포터와 마법사의 돌 설명' })
  @IsOptional()
  @IsString()
  description?: string;
}
