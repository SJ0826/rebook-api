import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  email: string;

  @ApiProperty({ example: 'qwer1234!' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100, { message: '비밀번호는 최대 100자까지 가능합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 최소 1개 이상 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50)
  name: string;
}
