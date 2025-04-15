import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------
  // 사용자의 채팅 목록 조회
  // --------------------------------
  async getChatList(userId: number) {
    const userChatRooms = await this.prisma.userChatRoom.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            order: {
              include: {
                book: {
                  include: {
                    bookImage: {
                      take: 1,
                    },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            UserChatRoom: {
              where: {
                userId: {
                  not: userId,
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // 🔢 안 읽은 메시지 개수 계산 추가
    const enriched = await Promise.all(
      userChatRooms.map(async (ucr) => {
        const chatRoomId = ucr.chatRoomId;
        const lastReadAt = ucr.lastReadAt;

        const unreadCount = await this.prisma.message.count({
          where: {
            chatRoomId,
            senderId: { not: userId },
            createdAt: { gt: lastReadAt },
          },
        });

        return {
          chatRoomId: Number(chatRoomId),
          lastMessage: ucr.chatRoom.messages[0]?.content ?? null,
          lastMessageTime: ucr.chatRoom.messages[0]?.createdAt ?? null,
          opponent: ucr.chatRoom.UserChatRoom[0]?.user
            ? {
                userId: Number(ucr.chatRoom.UserChatRoom[0].user.id),
                name: ucr.chatRoom.UserChatRoom[0].user.name,
                imageUrl: ucr.chatRoom.UserChatRoom[0].user.imageUrl,
              }
            : null,
          bookImage: ucr.chatRoom.order?.book?.bookImage[0]?.imageUrl ?? null,
          unreadCount,
        };
      }),
    );

    return enriched;
  }

  // --------------------------------
  // 특정 채팅방의 메시지 조회
  // --------------------------------
  async getMessages(chatRoomId: number) {
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // --------------------------------------
  // 사용자별 읽지 않은 메시지 개수 조회
  // --------------------------------------
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

  // --------------------------------
  // 채팅방의 읽지 않은 메세지 조회
  // --------------------------------

  // ---------------------------------------------------
  // 사용자가 채팅방을 읽었을 때 'lastReadAt' 업데이트
  // ---------------------------------------------------
  async markChatAsRead(userId: number, chatRoomId: number) {
    return this.prisma.userChatRoom.update({
      where: { userId_chatRoomId: { userId, chatRoomId } },
      data: { lastReadAt: new Date() },
    });
  }
}
