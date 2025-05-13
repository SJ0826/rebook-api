import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';
import { MyModule } from './my/my.module';
import { MailModule } from './mail/mail.module';
import {
  appConfig,
  awsConfig,
  databaseConfig,
  jwtConfig,
  mailConfig,
} from './config/env.config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate,
      load: [databaseConfig, jwtConfig, awsConfig, mailConfig, appConfig],
    }),
    AuthModule,
    PrismaModule,
    BooksModule,
    FavoritesModule,
    OrdersModule,
    ChatModule,
    FileModule,
    MyModule,
    MailModule,
  ],
})
export class AppModule {}
