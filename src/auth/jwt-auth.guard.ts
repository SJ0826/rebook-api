import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

/**
 * 1. 요청을 가로채서 토큰을 검증한다
 * 2. req.user에 사용자 정보를 자동으로 추가한다
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(err: any, user: TUser, info: any): TUser {
    if (err || !user) {
      throw new UnauthorizedException('인증이 필요합니다.');
    }
    return user;
  }
}
