import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123!',
    description: '현재 비밀번호',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword456@',
    description: '새 비밀번호 (8자 이상, 영문/숫자/특수문자 포함)',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
