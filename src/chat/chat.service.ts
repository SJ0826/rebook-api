import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  // --------------------------------
  // 사용자의 채팅 목록 조회
  // --------------------------------
  async getChatList(userId: number, bookId?: number) {
    const userChatRooms = await this.prisma.userChatRoom.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            order: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    saleStatus: true,
                    sellerId: true,
                    bookImage: {
                      take: 1,
                      select: {
                        imageUrl: true,
                      },
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
      userChatRooms
        .filter((ucr) => {
          if (!bookId) return true;
          return Number(ucr.chatRoom.order.book.id) == bookId;
        })
        .map(async (ucr) => {
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
            book: ucr.chatRoom.order.book,
            lastMessage: ucr.chatRoom.messages[0]?.content ?? null,
            lastMessageTime: ucr.chatRoom.messages[0]?.createdAt ?? null,
            opponent: ucr.chatRoom.UserChatRoom[0]?.user
              ? {
                  userId: Number(ucr.chatRoom.UserChatRoom[0].user.id),
                  name: ucr.chatRoom.UserChatRoom[0].user.name,
                  imageUrl: ucr.chatRoom.UserChatRoom[0].user.imageUrl,
                }
              : null,
            unreadCount,
          };
        }),
    );

    return enriched;
  }

  // --------------------------------
  // 특정 채팅방의 메시지 조회
  // --------------------------------
  async getMessages(chatRoomId: number, take: number, before?: string) {
    return this.prisma.message.findMany({
      where: {
        chatRoomId,
        ...(before && {
          createdAt: { lt: new Date(before) },
        }),
      },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        sender: true,
      },
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

  // --------------------------------
  // 사용자 메세지 전송 (send)
  // --------------------------------
  async saveMessage({
    content,
    senderId,
    chatRoomId,
  }: {
    content: string;
    senderId: number;
    chatRoomId: number;
  }) {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
        chatRoomId,
      },
    });
  }
}
