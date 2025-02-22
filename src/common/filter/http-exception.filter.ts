import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { statusCode: number; error: string; message: string | string[] };

    if (typeof error === 'string') {
      response.status(status).json({
        success: false,
        statusCode: status,
        path: request.url,
        error,
        timeStamp: new Date().toISOString(),
      });
    } else {
      response.status(status).json({
        success: false,
        ...error,
        timeStamp: new Date().toISOString(),
      });
    }
  }
}
