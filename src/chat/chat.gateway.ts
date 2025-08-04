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
    this.logger = new CustomLogger();
    this.logger.log('✅ WebSocket Gateway 실행됨! 🚀', 'ChatGateway');
  }

  afterInit(server: Server) {
    this.logger.debug('웹소켓 서버 초기화 ✅');
    this.server = server;
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`${client.id} is disconnected...`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`🚪 소켓 연결 시도: ${client.id}`);
    this.logger.log(`🌐 Origin: ${client.handshake.headers.origin}`);

    const token = client.handshake.auth?.token;
    const jwtSecret = this.config.get('JWT_SECRET');

    this.logger.log(`🔑 토큰 존재: ${!!token}`);
    this.logger.log(`🔐 JWT_SECRET 존재: ${!!jwtSecret}`);

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

      // ✅ 수정: client.data에 전체 payload와 간단한 user 객체 저장
      client.data.user = {
        id: payload.userId,
        // 필요한 다른 사용자 정보도 여기에 추가 가능
      };
      client.data.authenticated = true;
      client.data.payload = payload; // 전체 payload도 저장

      this.logger.log(`✅ 인증 성공: ${client.id}`);
      this.logger.log(`👤 사용자 ID: ${payload.userId}`);
      this.logger.log(
        `⏰ 토큰 만료시간: ${new Date(payload.exp * 1000).toISOString()}`,
      );

      client.emit('authenticated', { userId: payload.userId });
    } catch (err) {
      this.logger.error(`❌ 인증 실패: ${client.id}`);
      this.logger.error(`💥 에러 메시지: ${err.message}`);

      client.emit('error', { message: '유효하지 않은 토큰입니다.' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: number },
  ) {
    await client.join(`chat-${data.chatRoomId}`);
    this.logger.log(`👥 방 입장: ${client.id} -> chat-${data.chatRoomId}`);
  }

  @SubscribeMessage('message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: number; content: string },
  ) {
    const user = this.getUserFromSocket(client);

    // ✅ 디버깅 로그 추가
    this.logger.log(`📨 메시지 전송 시도: ${client.id}`);
    this.logger.log(`👤 인증된 사용자: ${JSON.stringify(user)}`);
    this.logger.log(`🔒 인증 상태: ${client.data.authenticated}`);

    if (!user) {
      this.logger.error(
        `❌ 인증되지 않은 사용자의 메시지 전송 시도: ${client.id}`,
      );
      throw new WsException('인증된 사용자만 메시지를 보낼 수 있습니다.');
    }

    try {
      const message = await this.chatService.saveMessage({
        chatRoomId: data.chatRoomId,
        content: data.content,
        senderId: user.id,
      });

      this.server.to(`chat-${data.chatRoomId}`).emit('newMessage', message);
      this.logger.log(`✅ 메시지 전송 성공: ${client.id}`);
    } catch (error) {
      this.logger.error(`❌ 메시지 저장 실패: ${error.message}`);
      throw new WsException('메시지 전송에 실패했습니다.');
    }
  }

  // ✅ 수정: client.data에서 사용자 정보를 가져오도록 변경
  getUserFromSocket(client: Socket): { id: number } | null {
    try {
      // 이미 handleConnection에서 인증된 사용자 정보 사용
      if (client.data.authenticated && client.data.user) {
        return client.data.user;
      }

      // 백업: client.data에 정보가 없다면 토큰을 다시 검증
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`⚠️  토큰 없음: ${client.id}`);
        return null;
      }

      const jwtSecret = this.config.get('JWT_SECRET');
      const payload = this.jwtService.verify(token, {
        secret: jwtSecret, // ✅ 수정: secret 명시적 전달
      });

      return { id: payload.userId };
    } catch (error) {
      this.logger.error(`❌ 사용자 인증 확인 실패: ${error.message}`);
      return null;
    }
  }
}
