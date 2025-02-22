import { ApiProperty } from '@nestjs/swagger';
import { IsBigint } from '../../common/decorators/IsBigint';

export class CreateOrderDto {
  @ApiProperty()
  @IsBigint({ message: 'id 유효한 bigint 값이어야 합니다.' })
  bookId: bigint;
}
