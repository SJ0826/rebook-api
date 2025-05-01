import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetChatMessagesDto {
  @ApiPropertyOptional({
    example: 20,
    description: '가져올 메시지 개수 (기본값: 20)',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take = 20;

  @ApiPropertyOptional({
    example: '2024-04-22T13:00:00.000Z',
    description: '이 시간 이전 메시지를 조회합니다. (ISO 8601 형식)',
  })
  @IsOptional()
  @IsString()
  before?: string;
}
