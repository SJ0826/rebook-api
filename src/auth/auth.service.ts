import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';

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
    const payload = { userId: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return { accessToken };
  }
}
