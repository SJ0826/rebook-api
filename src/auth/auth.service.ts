import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CookieOptions, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addMinutes, isAfter } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ResendVerificationEmailOutDto } from './dto/email.dto';

const TOKEN_EXPIRY_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  /**
   * 회원가입
   */
  async register(dto: UserRegisterDto, response: Response) {
    const { email, password, name } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { token, expiry } = this.generateEmailVerificationToken();

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailToken: token,
        emailTokenExpiry: expiry,
      },
    });

    await this.mailService.sendVerificationEmail(email, token);
    return {};
  }

  /**
   * 이메일 인증 코드 재전송
   */
  async resendVerificationEmail({ email }: ResendVerificationEmailOutDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('해당 이메일의 사용자를 찾을 수 없습니다.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('이미 인증이 완료된 이메일입니다.');
    }

    const { token, expiry } = this.generateEmailVerificationToken();

    await this.prisma.user.update({
      where: { email },
      data: {
        emailToken: token,
        emailTokenExpiry: expiry,
      },
    });

    await this.mailService.sendVerificationEmail(email, token);
    return { message: '인증 이메일을 다시 전송했습니다.' };
  }

  /**
   * 이메일 인증
   */
  async verifyEmail(token: string, response: Response) {
    const user = await this.prisma.user.findFirst({
      where: { emailToken: token },
    });

    if (
      !user ||
      !user.emailTokenExpiry ||
      isAfter(new Date(), user.emailTokenExpiry)
    ) {
      throw new BadRequestException('유효하지 않거나 만료된 토큰입니다.');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        emailVerified: true,
        emailToken: null,
        emailTokenExpiry: null,
      },
    });

    response.cookie('refreshToken', refreshToken, this.setCookieOptions());
    return { accessToken };
  }

  /**
   * 로그인
   */
  async login(dto: UserLoginDto, response: Response) {
    const { email, password } = dto;

    // 이메일, 비밀번호 검증
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // JWT 발급
    const { accessToken, refreshToken } = this.generateTokens(user.id);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // 쿠키에 리프레시토큰 저장
    response.cookie('refreshToken', refreshToken, this.setCookieOptions());
    return {
      accessToken,
    };
  }

  /**
   * 엑세스 토큰과 리프레시 토큰을 새로 갱신합니다.
   */
  async refreshToken(refreshToken: string, response: Response) {
    // 1. RefreshToken에서 userId 추출
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'JWT_SECRET',
      });
    } catch {
      throw new BadRequestException('유효하지 않은 토큰 형식입니다');
    }

    // 2. DB에서 유저 정보 확인
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (
      !user ||
      !user.refreshToken ||
      !(await bcrypt.compare(refreshToken, user.refreshToken))
    ) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 4. 새 토큰 발급
    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(
      user.id,
    );

    // 5. 새 refreshToken 해싱 후 DB 업데이트 (이전 토큰 무효화)
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNewRefreshToken },
    });

    // 6. 쿠키에 리프레시토큰 저장    response.cookie('refreshToken', newRefreshToken, this.setCookieOptions());
    return { accessToken };
  }

  /**
   * 로그아웃
   */
  async logout(response: Response, userId: bigint) {
    response.clearCookie('refreshToken', this.setCookieOptions());

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: '로그아웃 성공' };
  }

  /**
   * 유저 프로필 조회
   */
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 쿠키 설정
  private setCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  // JWT 토큰 생성
  private generateTokens(userId: bigint) {
    const jwtSecret = this.config.get<string>('JWT_SECRET');

    const accessToken = this.jwtService.sign(
      { userId },
      { secret: jwtSecret, expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { userId },
      { secret: jwtSecret, expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  // 이메일 인증 토큰 생성
  private generateEmailVerificationToken() {
    const token = uuidv4();
    const expiry = addMinutes(new Date(), TOKEN_EXPIRY_MINUTES);
    return { token, expiry };
  }
}
