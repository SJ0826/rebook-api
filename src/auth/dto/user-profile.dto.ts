import { ApiProperty } from '@nestjs/swagger';

export class UserProfileOutDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: bigint;

  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  name: string;

  @ApiProperty({ example: '2025-03-19T05:22:25.065Z', description: '가입일' })
  createdAt: Date;
}
