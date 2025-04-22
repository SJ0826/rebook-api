import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  credentials: true,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    console.log('✅ WebSocket Gateway 실행됨! 🚀');
  }

  afterInit() {
    this.logger.debug('웹소켓 서버 초기화 ✅');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(` is discsonnected...`);
  }

  /**
   * 인증
   */
  handleConnection(client: Socket) {
    this.logger.log('🚪 소켓 연결 시도됨');
    const token = client.handshake.auth?.token;

    if (!token) {
      this.logger.warn('❌ 토큰 없음, 연결 종료');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(
        token,
        this.config.get('JWT_SECRET'),
      );
      client.data.user = payload;
      this.logger.log(`✅ 인증 성공: ${JSON.stringify(payload)}`);
    } catch (err) {
      this.logger.error(`❌ 인증 실패: ${err.message}`);
      client.disconnect();
    }
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

  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: number; content: string },
  ) {
    const user = this.getUserFromSocket(client);
    this.logger.debug(user, '여기야 여기');
    if (!user) {
      throw new WsException('인증된 사용자만 메시지를 보낼 수 있습니다.');
    }
    const message = await this.chatService.saveMessage({
      chatRoomId: data.chatRoomId,
      content: data.content,
      senderId: user.id,
    });

    this.server.to(`chat-${data.chatRoomId}`).emit('newMessage', message);
  }

  getUserFromSocket(client: Socket): { id: number } | null {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      return { id: payload.userId };
    } catch (e) {
      return null;
    }
  }
}
