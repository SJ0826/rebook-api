import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   */
  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // 사용자 생성
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  }

  /**
   * 로그인
   */
  async login(dto: LoginDto) {
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

    // JWT 토큰 발급
    // const payload = { userId: user.id, email: user.email };
    // const accessToken = this.jwtService.sign(payload, {
    //   secret: process.env.JWT_SECRET,
    //   expiresIn: '1h',
    // });

    // Access Token & Refresh Token 생성
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '7d' },
    );

    // Refresh Token을 해싱 후 저장
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  // Access Token 갱신
  async refreshToken(refreshToken: string) {
    // RefreshToken에서 userId 추출
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET || 'JWT_SECRET',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('인증 정보가 없습니다');
    }

    // Refresh Token 검증
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.');
    }

    // 새 accessToken 발급
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '15m' },
    );

    return { accessToken };
  }
}
