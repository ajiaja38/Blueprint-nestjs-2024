import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenForgotPassword } from './schema/tokenForgotPassword.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { MessageService } from '../message/message.service';

@Injectable()
export class TokenForgotPasswordService {
  constructor(
    @InjectModel(TokenForgotPassword.name)
    private readonly tokenForgotPasswordSchema: Model<TokenForgotPassword>,
    private readonly messageService: MessageService,
  ) {}

  async createTokenForgotPassword(userGuid: string): Promise<string> {
    const tokenLength: number = 6;
    const token: string = randomBytes(Math.ceil(tokenLength / 2))
      .toString('hex')
      .slice(0, tokenLength);

    const tokenForgotPassword: TokenForgotPassword =
      await this.tokenForgotPasswordSchema.create({
        token,
        userGuid,
      });

    return tokenForgotPassword.token;
  }

  async findDataByToken(token: string): Promise<TokenForgotPassword> {
    const tokenForgotPassword: TokenForgotPassword =
      await this.tokenForgotPasswordSchema.findOne({ token });

    if (!tokenForgotPassword) throw new NotFoundException('Token not found');

    return tokenForgotPassword;
  }

  async deleteToken(token: string): Promise<void> {
    await this.tokenForgotPasswordSchema.findOneAndDelete({ token });
  }
}
