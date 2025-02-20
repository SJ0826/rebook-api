import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  BigInt.prototype.toJSON = function() {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Rebook API')
    .setDescription('The Rebook API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

declare global {
  interface BigInt {
    toJSON(): Number;
  }
}
