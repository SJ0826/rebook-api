import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './common/adapters/ws.adapter';

async function bootstrap() {
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      // github actions test 4
      'http://localhost:3000',
      'https://rebook-v2.d2nh4o8zioz2s8.amplifyapp.com',
      'https://main.d2nh4o8zioz2s8.amplifyapp.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rebook API')
    .setDescription('The Rebook API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  // 전역 인터셉터, 필터, 파이프, WebSocket 어댑터
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  await app.listen(configService.get('PORT') ?? 3000);
}

bootstrap();

declare global {
  interface BigInt {
    toJSON(): number;
  }
}
