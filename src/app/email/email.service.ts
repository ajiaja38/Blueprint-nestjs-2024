import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  sendEmailForgotPassword(email: string, token: string): void {
    try {
      this.mailerService.sendMail({
        to: email,
        subject: '[PRESENCE] Your Token Forgot Password',
        html: `<p>Here is your token forgot password</p><p><strong>${token}</strong></p>`,
      });
    } catch (error) {
      console.log(error.message);
    }
  }
}
