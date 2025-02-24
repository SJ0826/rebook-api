import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { FavoritesModule } from './favorites/favorites.module';
import { OrdersModule } from './orders/orders.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    BooksModule,
    FavoritesModule,
    OrdersModule,
    ChatModule,
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, S3Service],
})
export class AppModule {
}
