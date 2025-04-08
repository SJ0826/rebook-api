import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as process from 'node:process';

// JWT를 Authorization 헤더에서 추출
// 토큰을 검증하고, 유효하면 사용자 정보를 반환
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'JWT_SECRET', // 환경변수 설정
    } as any);
  }

  async validate(payload: { userId: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    return user;
  }
}
