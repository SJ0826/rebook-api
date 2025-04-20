import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  imports: [AuthModule],
})
export class ChatModule {}
