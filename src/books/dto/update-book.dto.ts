import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBigint } from '../../common/decorators/IsBigint';

export class UpdateBookDto {
  @ApiProperty({ example: '해리 포터와 마법사의 돌 수정' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'J.K. 롤링' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ example: '문학수첩' })
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiProperty({ example: 15000 })
  @IsOptional()
  @IsBigint({ message: 'id 유효한 bigint 값이어야 합니다.' })
  price?: number;

  @ApiProperty({ example: '해리 포터와 마법사의 돌 설명' })
  @IsOptional()
  @IsBigint({ message: 'id 유효한 bigint 값이어야 합니다.' })
  description?: string;
}
