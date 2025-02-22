import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsBigint(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBigint',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // BigInt 타입이 아닐 경우 false 반환
          return typeof value === 'bigint';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 값은 반드시 BigInt 타입이어야 합니다.`;
        },
      },
    });
  };
}
