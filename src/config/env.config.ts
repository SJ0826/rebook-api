import { registerAs } from '@nestjs/config';
import * as process from 'node:process';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
}));

export const awsConfig = registerAs('aws', () => ({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.AWS_S3_BUCKET_NAME,
  cloudFontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
}));

export const mailConfig = registerAs('mail', () => ({
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  from: process.env.MAIL_FROM,
  tokenExpiry: process.env.MAIL_TOKEN_EXPIRY,
}));

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  port: process.env.PORT || 4000,
}));
