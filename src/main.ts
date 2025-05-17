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

  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);

  // cors error
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://main.d2nh4o8zioz2s8.amplifyapp.com',
      'https://main.d2nh4o8zioz2s8.amplifyapp.com',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.use(cookieParser());

  // swagger setting
  const config = new DocumentBuilder()
    .setTitle('Rebook API')
    .setDescription('The Rebook API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // global http exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // global pips
  app.useGlobalPipes(new ValidationPipe());

  // ws adapter
  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  await app.listen(configService.get('PORT') ?? 3000);
}

bootstrap();

declare global {
  interface BigInt {
    toJSON(): number;
  }
}
