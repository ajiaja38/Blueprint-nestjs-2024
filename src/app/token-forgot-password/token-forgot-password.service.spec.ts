import { Test, TestingModule } from '@nestjs/testing';
import { TokenForgotPasswordService } from './token-forgot-password.service';

describe('TokenForgotPasswordService', () => {
  let service: TokenForgotPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenForgotPasswordService],
    }).compile();

    service = module.get<TokenForgotPasswordService>(TokenForgotPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
