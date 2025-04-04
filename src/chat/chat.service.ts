import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * 특정 채팅방의 메시지 조회
   */
  async getMessages(chatRoomId: number) {
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 사용자별 읽지 않은 메시지 개수 조회
   */
  async getUnreadMessagesCount(userId: number) {
    return this.prisma.chatRoom.findMany({
      where: { UserChatRoom: { some: { userId } } },
      select: {
        id: true,
        _count: {
          select: {
            messages: {
              where: { createdAt: { gt: new Date() } },
            },
          },
        },
      },
    });
  }

  /**
   * 사용자가 채팅방을 읽었을 때 'lastReadAt' 업데이트
   */
  async markChatAsRead(userId: number, chatRoomId: number) {
    return this.prisma.userChatRoom.update({
      where: { userId_chatRoomId: { userId, chatRoomId } },
      data: { lastReadAt: new Date() },
    });
  }
}
