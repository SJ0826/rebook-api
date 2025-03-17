import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 회원가입
   */
  async register(dto: UserRegisterDto, response: Response) {
    return this.prisma.$transaction(async (tx) => {
      const { email, password, name } = dto;

      // 이메일 중복 체크
      const existingUser = await tx.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('이미 사용중인 이메일입니다.');
      }

      // 비밀번호 해싱
      const hashedPassword: string = await bcrypt.hash(password, 10);

      // 사용자 생성
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      });

      // Access Token & Refresh Token 생성
      const accessToken = this.jwtService.sign(
        { userId: user.id },
        { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { userId: user.id },
        { secret: this.config.get<string>('JWT_SECRET'), expiresIn: '7d' },
      );

      // Refresh Token을 해싱 후 저장
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await tx.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      // Set refresh token as HTTP-only cookie
      response.cookie('refreshToken', refreshToken, this.setCookieOptions());

      return {
        accessToken,
      };
    });
  }

  /**
   * 로그인
   */
  async login(dto: UserLoginDto, response: Response) {
    const { email, password } = dto;

    // 이메일 확인
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // JWT 발급
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Refresh Token을 해싱 후 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Set refresh token as HTTP-only cookie
    response.cookie('refreshToken', refreshToken, this.setCookieOptions());

    return {
      accessToken,
    };
  }

  /**
   * AccessToken과 RefreshToken을 새로 갱신합니다.
   */
  async refreshToken(refreshToken: string, response: Response) {
    let payload;

    // 1. RefreshToken에서 userId 추출
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

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('인증 정보가 없습니다');
    }

    // 3. Refresh Token 검증
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 4. 새 accessToken 발급
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '15m' },
    );

    // 5. 새 refreshToken 발급
    const newRefreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      { expiresIn: '7d' },
    );

    // 6. 새 refreshToken 해싱 후 DB 업데이트 (이전 토큰 무효화)
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNewRefreshToken },
    });

    // 7. Set refresh token as HTTP-only cookie
    response.cookie('refreshToken', refreshToken, this.setCookieOptions());

    return { accessToken };
  }

  /**
   * 로그아웃
   */
  async logout(response: Response, userId: bigint) {
    response.clearCookie('refreshToken');

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: '로그아웃 성공' };
  }

  private setCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  /**
   * JWT 토큰 생성
   */
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
}
