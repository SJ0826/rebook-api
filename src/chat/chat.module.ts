import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatService, PrismaService],
  controllers: [ChatController],
})
export class ChatModule {}
