import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('images')
@UseGuards(JwtAuthGuard)
@ApiTags('이미지 파일 업로드')
@ApiBearerAuth()
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 401, description: '인증 실패' })
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 파일 (다중) 업로드 API
   */
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      limits: { fileSize: 7 * 1024 * 1024 }, // 최대 7MB 제한
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 413,
    description: '이미지 용량 초과',
  })
  @ApiResponse({
    status: 415,
    description: 'gif, jpeg, png 형식의 파일이 아닌 경우',
  })
  @ApiBody({
    description: '업로드할 이미지 파일들',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일 (다중 가능)',
        },
      },
    },
  })
  @ApiOperation({
    summary: '이미지 파일 업로드',
    description:
      '이미지 파일을 업로드하고 UUID를 반환받습니다. <br /> <li>이미지 파일의 최대용량: 7MB</li> <br /> <li>허용 확장자: gif, jpeg, png</li>',
  })
  async uploadImages(@UploadedFiles() images: Express.Multer.File[]) {
    // if (!files || files.length === 0) {
    //   throw new BadRequestException('파일을 하나 이상 업로드해야 합니다.');
    // }

    return await this.fileService.uploadImages(images);
  }
}
