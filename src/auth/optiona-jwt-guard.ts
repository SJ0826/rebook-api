import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(err: any, user: TUser, info: any): TUser | null {
    // 인증 실패해도 에러를 던지지 않고 넘어감
    if (err) {
      throw err;
    }
    return user || null; // user가 없으면 null 반환
  }
}
