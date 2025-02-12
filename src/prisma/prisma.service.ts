import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * NestJS에서 Prisma client를 전역으로 사용하도록 설정
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(); // prismaClient 생성
  }

  async onModuleInit() {
    // 애플리케이션 시작될 때 DB연결
    await this.$connect();
  }

  async onModuleDestroy() {
    // 애플리케이션 종료될 때 DB연결 해제
    await this.$disconnect();
  }
}
