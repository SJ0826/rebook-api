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

@Module({
  imports: [
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
