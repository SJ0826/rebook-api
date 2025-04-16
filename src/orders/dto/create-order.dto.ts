import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNumber()
  bookId: number;
}

export class CreateOrderDtoOut {}
