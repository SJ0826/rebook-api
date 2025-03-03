import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * NestJS에서 Prisma client를 전역으로 사용하도록 설정
 */
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    this.$on('query', (event) => {
      this.logger.debug('Query: ' + event.query);
      this.logger.debug('Params: ' + event.params);
      this.logger.debug('Duration: ' + event.duration + 'ms');
    });

    this.$on('error', (event) => {
      this.logger.error(event.target);
    });

    await this.$connect();
  }
}
