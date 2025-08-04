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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CustomLogger } from '../common/logger/custom.logger';

@WebSocketGateway({
  // cors: {
  //   origin: 'https://rebook-v2.d2nh4o8zioz2s8.amplifyapp.com',
  //   methods: ['GET', 'POST'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  //   credentials: true,
  // },
  credentials: true,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private readonly logger: CustomLogger;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('✅ WebSocket Gateway 실행됨! 🚀', 'ChatGateway');

    console.log('✅ WebSocket Gateway 실행됨! 🚀');
  }

  afterInit(server: Server) {
    this.logger.debug('웹소켓 서버 초기화 ✅');
    this.server = server;

    // const allowedOrigin = 'https://rebook-v2.d2nh4o8zioz2s8.amplifyapp.com';

    // 동적으로 CORS 설정 변경
    // server.engine.opts.cors = {
    //   origin: allowedOrigin,
    //   methods: ['GET', 'POST'],
    //   allowedHeaders: ['Content-Type', 'Authorization'],
    //   credentials: true,
    // };
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(` is discsonnected...`);
  }

  /**
   * 인증
   */
  handleConnection(client: Socket) {
    this.logger.log(`🚪 소켓 연결 시도: ${client.id}`);
    this.logger.log(`🌐 Origin: ${client.handshake.headers.origin}`);

    const token = client.handshake.auth?.token;
    const jwtSecret = this.config.get('JWT_SECRET');

    // 🔍 디버깅 로그 추가
    this.logger.log(`🔑 토큰 존재: ${!!token}`);
    this.logger.log(`🔐 JWT_SECRET 존재: ${!!jwtSecret}`);
    this.logger.log(`🔐 JWT_SECRET 길이: ${jwtSecret?.length || 0}`);

    if (token) {
      this.logger.log(`🎫 토큰 앞 10자리: ${token.substring(0, 10)}...`);
    }

    if (!token) {
      this.logger.warn(`❌ 토큰 없음, 연결 종료: ${client.id}`);
      client.emit('error', { message: '인증 토큰이 필요합니다.' });
      client.disconnect(true);
      return;
    }

    if (!jwtSecret) {
      this.logger.error(`❌ JWT_SECRET 환경변수 없음!`);
      client.emit('error', { message: '서버 설정 오류입니다.' });
      client.disconnect(true);
      return;
    }

    try {
      this.logger.log(`🔍 JWT 검증 시작...`);

      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });

      client.data.user = payload;
      client.data.authenticated = true;

      this.logger.log(`✅ 인증 성공: ${client.id}`);
      this.logger.log(`👤 사용자 ID: ${payload.userId}`);
      this.logger.log(
        `⏰ 토큰 만료시간: ${new Date(payload.exp * 1000).toISOString()}`,
      );

      // 인증 성공 알림
      client.emit('authenticated', { userId: payload.userId });
    } catch (err) {
      this.logger.error(`❌ 인증 실패: ${client.id}`);
      this.logger.error(`💥 에러 메시지: ${err.message}`);
      this.logger.error(`📋 에러 스택: ${err.stack}`);

      client.emit('error', { message: '유효하지 않은 토큰입니다.' });
      client.disconnect(true);
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
  }

  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: number; content: string },
  ) {
    const user = this.getUserFromSocket(client);
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
