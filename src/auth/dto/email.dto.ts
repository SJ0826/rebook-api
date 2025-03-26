import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationEmailOutDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;
}
