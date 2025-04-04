import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  AWS_CLOUDFRONT_DOMAIN: string;

  @IsString()
  @IsNotEmpty()
  MAIL_USER: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASS: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM: string;

  @IsNumber()
  @IsNotEmpty()
  MAIL_TOKEN_EXPIRY: number;

  @IsString()
  @IsOptional()
  NODE_ENV?: string = 'development';

  @IsBoolean()
  @IsOptional()
  ENABLE_SWAGGER?: boolean = true;

  @IsNumber()
  @IsOptional()
  PORT?: number = 4000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeUnsetFields: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  console.log('[검증 결과]', errors);

  if (errors.length > 0) {
    const errorMessages = errors.map((error) => {
      return Object.values(error.constraints || {}).join(', ');
    });
    throw new Error(
      `Environment validation failed: ${errorMessages.join('; ')}`,
    );
  }

  return validatedConfig;
}
