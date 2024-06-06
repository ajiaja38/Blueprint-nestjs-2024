import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { MessageModule } from './app/message/message.module';
import { TimezoneModule } from './app/timezone/timezone.module';
import { UploaderModule } from './app/uploader/uploader.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ExceptionFilter } from './filter/exception.filter';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailModule } from './app/email/email.module';
import { TokenForgotPasswordModule } from './app/token-forgot-password/token-forgot-password.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.DATABASE),
    CacheModule.register({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_NAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.EMAIL_NAME,
      },
      preview: true,
    }),
    UserModule,
    AuthModule,
    MessageModule,
    TimezoneModule,
    UploaderModule,
    EmailModule,
    TokenForgotPasswordModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
