import { IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  bookId: number;
}
