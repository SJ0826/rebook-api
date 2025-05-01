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
    const req = ctx.getRequest<Request>();
    // WebSocket 요청이라면 무시 (핸들링하지 않음)
    // if (
    //   host.getType() !== 'http' ||
    //   req.url.startsWith('/ws-chat') ||
    //   ctx.getRequest<Request>().url.includes('/socket.io/')
    // ) {
    //   return;
    // }

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
