import { ApiProperty } from '@nestjs/swagger';
import { IsBigint } from '../../common/decorators/is-bigint.decorator';
import { TransformToBigInt } from '../../common/decorators/transform-to-bigint.decorator';

export class CreateOrderDto {
  @ApiProperty()
  @TransformToBigInt()
  @IsBigint()
  bookId: bigint;
}
