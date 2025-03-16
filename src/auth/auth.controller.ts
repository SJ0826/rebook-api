import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
@ApiTags('인증')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '사용자 회원가입',
    description: '사용자가 회원가입을 진행합니다.',
  })
  @ApiResponse({ status: 200, description: '회원가입 성공' })
  async register(
    @Body() userRegisterDto: UserRegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(userRegisterDto, response);
  }

  @Post('login')
  @ApiOperation({
    summary: '사용자 로그인',
    description: '사용자가 로그인을 진행합니다.',
  })
  @ApiResponse({ status: 200, description: '회원가입 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(userLoginDto, response);
  }

  @Post('refresh')
  @ApiOperation({
    summary: '토큰 갱신',
    description: '사용자가 토큰 갱신을 진행합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiBearerAuth()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(req.cookies.refreshToken, response);
  }

  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자가 로그아웃을 진행합니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiBearerAuth()
  async logout(@Res({ passthrough: true }) response: Response, @Req() req) {
    return this.authService.logout(response, req.user.id);
  }
}
