import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // NODE_ENV 값에 따라 환경파일 경로를 지정합니다.
      // envFilePath: [
      //   path.resolve(
      //     process.cwd(),
      //     `src/config/env/.env.${process.env.NODE_ENV}`,
      //   ),
      // ],
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
    PrismaModule,
    BooksModule,
    FavoritesModule,
    OrdersModule,
    ChatModule,
    FileModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class AppModule {}
