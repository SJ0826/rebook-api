import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from './common/adapters/ws.adapter';
import { CustomLogger } from './common/logger/custom.logger';

async function bootstrap() {
  const customLogger = new CustomLogger();

  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const app = await NestFactory.create(AppModule, {
    // 시스템 로그 레벨 조정 (라우트 매핑 로그 숨기기)
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['error', 'warn', 'log'],
  });

  app.enableCors({
    origin: (origin, callback) => {
      console.log('🔍 CORS Origin:', origin);

      const allowedOrigins = [
        'http://localhost:3000',
        'https://rebook-v2.d2nh4o8zioz2s8.amplifyapp.com',
        'https://main.d2nh4o8zioz2s8.amplifyapp.com',
        'https://www.rebook.p-e.kr',
        'https://rebook.p-e.kr',
        'https://rebook-ba3urst53-sj0826s-projects.vercel.app', // vercel
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS Blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());

  app.useLogger(customLogger);

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
