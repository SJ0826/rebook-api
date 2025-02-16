import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 특정 채팅방의 기존 메세지 조회
   */
  @Get(':chatRoomId/messages')
  async getChatMessages(@Param('chatRoomId') chatRoomId: string) {
    return this.chatService.getMessages(Number(chatRoomId));
  }

  /**
   * 사용자별 읽지 않은 메시지 개수 조회
   */
  @Get('unread-messages')
  async getUnreadMessagesCount(@Req() req) {
    return this.chatService.getUnreadMessagesCount(req.user.id);
  }

  /**
   * 사용자가 채팅방을 읽었을 때 'lastReadAt' 업데이트
   */
  @Patch(':chatRoomId/read')
  async markChatAsRead(@Req() req, @Param('chatRoomId') chatRoomId: string) {
    return this.chatService.markChatAsRead(req.user.id, Number(chatRoomId));
  }
}
