import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'S3_CLIENT',
      useFactory: () => {
        return new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
          },
        });
      },
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
