import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer() server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {
    console.log('✅ WebSocket Gateway 실행됨! 🚀');
  }

  /**
   * 채팅방 입장 (joinRoom)
   */
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: number },
  ) {
    await client.join(`chat-${data.chatRoomId}`);

    // 기존 메세지를 불러와서 클라이언트에게 전송
    const messages = await this.chatService.getMessages(
      Number(data.chatRoomId),
    );
    client.emit('loadMessages', messages);
  }

  /**
   * 메시지 전송 (채팅)
   */
  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      chatRoomId: number;
      senderId: number;
      content: string;
    },
  ) {
    const { chatRoomId, senderId, content } = data;

    console.log('📩 받은 데이터:', data);
    // 메시지 저장
    const message = await this.prisma.message.create({
      data: { chatRoomId, senderId, content },
    });

    // 해당 채팅방의 모든 사용자에게 메시지 전송
    this.server.to(`chat-${chatRoomId}`).emit('newMessage', message);
  }
}
