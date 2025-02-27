import { Injectable } from '@nestjs/common';
import * as process from 'node:process';

@Injectable()
export class FileConfig {
  bucket = process.env.AWS_S3_BUCKET_NAME;
  region = process.env.AWS_REGION;
}
