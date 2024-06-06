import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import User, { UserSchema } from './schema/user.schema';
import { PasswordConfService } from './password-conf.service';
import { MessageModule } from '../message/message.module';
import { TimezoneModule } from '../timezone/timezone.module';
import { EmailModule } from '../email/email.module';
import { TokenForgotPasswordModule } from '../token-forgot-password/token-forgot-password.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TokenForgotPasswordModule,
    EmailModule,
    MessageModule,
    TimezoneModule,
  ],
  controllers: [UserController],
  providers: [UserService, PasswordConfService],
  exports: [UserService],
})
export class UserModule {}
