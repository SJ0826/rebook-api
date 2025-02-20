import { ApiProperty } from '@nestjs/swagger';

/**
 * API 공통 응답 DTO
 */
export class ResponseDto<T> {
  @ApiProperty({ description: '응답 상태', example: true })
  success: boolean;

  @ApiProperty({ description: '상태 코드', example: 200 })
  statusCode: number;

  @ApiProperty({
    description: '응답 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;

  @ApiProperty({ description: '응답 데이터', nullable: true })
  data?: T;

  constructor(success: boolean, statusCode: number, message: string, data?: T) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
