import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { S3Client } from '@aws-sdk/client-s3';
import { FileConfig } from './file.config';

@Module({
  imports: [ConfigModule],
  controllers: [FileController],
  providers: [
    FileService,
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
    FileConfig, // 파일 관련 설정 주입
  ],
})
export class FileModule {}
