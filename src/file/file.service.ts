import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AwsConfig } from '../config/env.type';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 다중 파일 업로드 + S3 URL 반환
   */
  async uploadImages(files: Express.Multer.File[]) {
    const awsConfig = this.config.get<AwsConfig>('aws');

    if (!files || files.length === 0) {
      throw new BadRequestException('파일을 하나 이상 업로드해야 합니다.');
    }

    const bucket = awsConfig?.s3Bucket;
    const cloudFrontDomain = awsConfig?.cloudFontDomain;
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uuid = uuidv4();
        const ext = file.originalname.split('.').pop();
        const key = `upload/book/${uuid}.${ext}`;
        const maxFileSize = 7 * 1024 * 1024;

        // 1. 확장자 검사
        if (ext && !allowedExtensions.includes(ext)) {
          throw new UnsupportedMediaTypeException(
            `이미지 파일만 업로드 가능합니다. (허용 확장자: ${allowedExtensions.join(', ')})`,
          );
        }

        // 2. 파일 크기 검사
        if (file.size > maxFileSize) {
          throw new PayloadTooLargeException(
            `이미지 최대 용량은 7MB입니다. (현재 파일 크기: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
          );
        }

        // 3. S3에 파일 업로드
        await this.s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        // 4. CloudFront URL 생성
        const imageFileUrl = `https://${cloudFrontDomain}/${key}`;

        // 5. bookImage 테이블에 uuid 저장
        await this.prisma.bookImage.create({
          data: { uuid, imageUrl: imageFileUrl },
        });

        return {
          uuid,
          imageUrl: imageFileUrl,
        };
      }),
    );

    return {
      files: uploadedImages,
    };
  }
}
