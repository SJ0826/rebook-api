import { Transform } from 'class-transformer';

export function TransformToBigInt() {
  return Transform(({ value }) => {
    if (typeof value === 'bigint') return value;
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  });
}
