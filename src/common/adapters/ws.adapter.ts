import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Injectable } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import { ConfigService } from '@nestjs/config';

// ws 연결 프론트 서버 주소를 동적으로 연결해준다.(dev/prod 구분)
@Injectable()
export class SocketIoAdapter extends IoAdapter {
  constructor(
    private readonly app: INestApplication, // NestApplication 객체
    private readonly config: ConfigService, // ConfigService
  ) {
    super(app.getHttpServer()); // ⚠️ HTTP 서버 인스턴스를 super에 전달
  }

  createIOServer(portOrServer: any, options?: ServerOptions) {
    const serverArg =
      typeof portOrServer === 'number' ? undefined : portOrServer;

    const partialOpts: Partial<ServerOptions> = {
      // cors: {
      //   origin: this.config.get('CLIENT_URL'),
      //   credentials: true,
      // },
    };

    return serverArg
      ? super.createIOServer(serverArg, partialOpts as ServerOptions)
      : super.createIOServer(portOrServer, partialOpts as ServerOptions);
  }
}
