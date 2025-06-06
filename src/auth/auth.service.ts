import {
  BadRequestException,
  Inject,
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
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { addMinutes, isAfter } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ResendVerificationEmailOutDto } from './dto/email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { generateProfileImage } from '../common/util/generate-profile-image';
import { AwsConfig, JwtConfig, MailConfig } from '../config/env.type';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    @Inject('S3_CLIENT') private readonly s3: S3Client,
  ) {}

  // ---------------------
  // 회원 가입
  // ---------------------
  async register(dto: UserRegisterDto, response: Response) {
    const { email, password, name } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    // 비활성화 유저 복구
    if (existingUser && !existingUser.isActive) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { token, expiry } = this.generateEmailVerificationToken();

      const imageUrl = await this.uploadProfileImage(name);

      await this.prisma.user.update({
        where: { email },
        data: {
          email: email,
          emailTokenExpiry: expiry,
          name,
          password: hashedPassword,
          isActive: true,
          imageUrl: imageUrl,
        },
      });

      await this.mailService.sendVerificationEmail(email, token);

      return { message: '기존 탈퇴 계정을 복구했습니다' };
    }

    // 중복 이메일 체크
    if (existingUser) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    // 비밀번호 해시 & 이메일 인증 토큰 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const { token, expiry } = this.generateEmailVerificationToken();

    // 기본 프로필 이미지 생성 및 업로드
    const imageUrl = await this.uploadProfileImage(name);

    // DB에 사용자 생성
    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailToken: token,
        emailTokenExpiry: expiry,
        imageUrl,
      },
    });

    // 인증 이메일 전송
    await this.mailService.sendVerificationEmail(email, token);

    return {};
  }

  // --------------------------
  // 이메일 인증 코드 재전송
  // --------------------------
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

  // ---------------------
  // 이메일 인증
  // ---------------------
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

    const { accessToken, refreshToken } = this.generateTokens(Number(user.id));
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

  // ---------------------
  // 로그인
  // ---------------------
  async login(dto: UserLoginDto, response: Response) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 이메일, 비밀번호 검증
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.error(password, user?.password);
      throw new BadRequestException('이메일 또는 비밀번호가 잘못되었습니다');
    }

    // 회원 탈퇴 유무 확인
    if (!user.isActive) {
      throw new BadRequestException('해당 계정은 이미 탈퇴 처리되었습니다');
    }

    // 이메일 인증 확인
    if (!user.emailVerified) {
      throw new BadRequestException('이메일 인증이 완료되지 않았습니다');
    }

    // JWT 발급
    const { accessToken, refreshToken } = this.generateTokens(Number(user.id));
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

  // -----------------------------------------
  // 엑세스 토큰과 리프레시 토큰 새로 갱신
  // -----------------------------------------
  async refreshToken(refreshToken: string, response: Response) {
    const jwtConfig = this.config.get<JwtConfig>('jwt');

    // 1. RefreshToken에서 userId 추출
    let payload: { userId: number };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: jwtConfig?.secret || 'JWT_SECRET',
      });
    } catch {
      response.clearCookie('refreshToken', this.setCookieOptions());
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
      Number(user.id),
    );

    // 5. 새 refreshToken 해싱 후 DB 업데이트 (이전 토큰 무효화)
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedNewRefreshToken },
    });

    // 6. 쿠키에 리프레시토큰 저장
    response.cookie('refreshToken', newRefreshToken, this.setCookieOptions());
    return { accessToken };
  }

  // ---------------------
  // 로그아웃
  // ---------------------
  async logout(response: Response, userId: number) {
    response.clearCookie('refreshToken', this.setCookieOptions());

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: '로그아웃 성공' };
  }

  // ---------------------
  // 비밀번호 변경
  // ---------------------
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('해당 이메일의 사용자를 찾을 수 없습니다.');
    }

    const { currentPassword, newPassword } = dto;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  // ---------------------
  // 회원 탈퇴
  // ---------------------
  async withdraw(userId: number, response: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    const maskedEmail = `${user.email}_deleted_${Date.now()}`;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, email: maskedEmail },
    });

    response.clearCookie('refreshToken', this.setCookieOptions());

    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  // ---------------------
  // 쿠키 설정
  // ---------------------
  private setCookieOptions(): CookieOptions {
    const nodeEnv = this.config.get('app.nodeEnv');
    const isProd = nodeEnv === 'production';

    return {
      httpOnly: true,
      secure: isProd, // 개발에선 false
      sameSite: isProd ? 'none' : 'lax', // CORS 허용
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  // ---------------------
  // JWT 토큰 생성
  // ---------------------
  private generateTokens(userId: number) {
    const jwtConfig = this.config.get<JwtConfig>('jwt');

    const accessToken = this.jwtService.sign(
      { userId },
      { secret: jwtConfig?.secret, expiresIn: jwtConfig?.accessTokenExpiry },
    );

    const refreshToken = this.jwtService.sign(
      { userId },
      { secret: jwtConfig?.secret, expiresIn: jwtConfig?.refreshTokenExpiry },
    );

    return { accessToken, refreshToken };
  }

  // --------------------------
  // 이메일 인증 토큰 생성
  // --------------------------
  private generateEmailVerificationToken() {
    const mailConfig = this.config.get<MailConfig>('mail');
    const token = uuidv4();
    const expiry = addMinutes(new Date(), mailConfig?.tokenExpiry ?? 15);
    return { token, expiry };
  }

  // --------------------------
  // 이미지 파일 업로드 (AWS S3)
  //---------------------------
  private async uploadProfileImage(name: string): Promise<string> {
    const awsConfig = this.config.get<AwsConfig>('aws');
    const uuid = uuidv4();
    const s3Key = `upload/user/${uuid}`;
    const imageBuffer = await generateProfileImage(name);

    const bucket = awsConfig?.s3Bucket;
    const cloudFrontDomain = awsConfig?.cloudFontDomain;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/png',
      }),
    );

    return `https://${cloudFrontDomain}/${s3Key}`;
  }
}
