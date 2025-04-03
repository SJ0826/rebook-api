import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"ReBook" <${process.env.MAIL_USER}>`,
      to,
      subject: '[ReBook] 이메일 인증을 완료해주세요!',
      html: `
        <h2>📚 ReBook 이메일 인증</h2>
        <p>아래 버튼을 클릭해서 이메일 인증을 완료해주세요.</p>
        <a href="${url}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:4px;">
          이메일 인증하기
        </a>
        <p style="margin-top:12px;">이 링크는 15분 동안만 유효합니다.</p>
      `,
    });
  }
}
