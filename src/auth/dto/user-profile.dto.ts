// user.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

class UserProfileBase {
  @ApiProperty({ example: '홍길동', description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'http://image-url', description: '프로필 이미지' })
  imageUrl: string | null;
}

export class UserProfileOutDto extends UserProfileBase {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  @IsString()
  email: string;

  @ApiProperty({ example: '2025-03-19T05:22:25.065Z', description: '가입일' })
  createdAt: Date;
}

export class UserEditProfileInDto extends PartialType(UserProfileBase) {}
