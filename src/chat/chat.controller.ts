import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatListItemDto } from './dto/chat-list.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiTags('채팅')
@ApiResponse({ status: 200, description: '성공' })
@ApiResponse({ status: 401, description: '인증 실패' })
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 사용자별 채팅방 목록 조회
   */
  @Get('/')
  @ApiOperation({
    summary: '채팅 목록 조회',
    description: '사용자가 채팅 목록을 조회합니다.',
  })
  @ApiOkResponse({ type: [ChatListItemDto] })
  async getChatList(@Req() req): Promise<ChatListItemDto[]> {
    return this.chatService.getChatList(req.user.id);
  }

  /**
   * 특정 채팅방의 기존 메세지 조회
   */
  @Get(':chatRoomId/messages')
  @ApiOperation({
    summary: '채팅 메시지 조회',
    description: '특정 채팅방의 기존 메시지를 조회합니다.',
  })
  async getChatMessages(@Param('chatRoomId') chatRoomId: string) {
    return this.chatService.getMessages(Number(chatRoomId));
  }

  /**
   * 사용자별 읽지 않은 메시지 개수 조회
   */
  @Get('unread-messages')
  @ApiOperation({
    summary: '읽지 않은 메시지 개수 조회',
    description: '사용자가 읽지 않은 메시지의 개수를 조회합니다.',
  })
  async getUnreadMessagesCount(@Req() req) {
    return this.chatService.getUnreadMessagesCount(req.user.id);
  }

  /**
   * 사용자가 채팅방을 읽었을 때 'lastReadAt' 업데이트
   */
  @Patch(':chatRoomId/read')
  @ApiOperation({
    summary: '채팅 읽음 처리',
    description:
      "사용자가 채팅방을 읽었을 때 해당 채팅방의 'lastReadAt'을 업데이트합니다.",
  })
  async markChatAsRead(@Req() req, @Param('chatRoomId') chatRoomId: string) {
    return this.chatService.markChatAsRead(req.user.id, Number(chatRoomId));
  }
}
