import { IsNumber } from 'class-validator';

export class CreateFavoriteDto {
  @IsNumber()
  bookId: number;
}
