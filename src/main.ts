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
  const configService = app.get(ConfigService);

  console.log('📂 .env.development MAIL_FROM:', process.env.MAIL_FROM);
  console.log(
    '📂 .env.development MAIL_TOKEN_EXPIRY:',
    process.env.MAIL_TOKEN_EXPIRY,
  );
  // cors error
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      configService.get('CLIENT_URL'),
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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
