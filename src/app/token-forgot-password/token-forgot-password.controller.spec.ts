import { Test, TestingModule } from '@nestjs/testing';
import { TokenForgotPasswordController } from './token-forgot-password.controller';
import { TokenForgotPasswordService } from './token-forgot-password.service';

describe('TokenForgotPasswordController', () => {
  let controller: TokenForgotPasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenForgotPasswordController],
      providers: [TokenForgotPasswordService],
    }).compile();

    controller = module.get<TokenForgotPasswordController>(TokenForgotPasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
