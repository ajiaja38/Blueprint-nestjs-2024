import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import User from './schema/user.schema';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import LoginDto from '../auth/dto/login.dto';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { PasswordConfService } from './password-conf.service';
import { RegisterUserDto } from './dto/register.dto';
import { TimezoneService } from '../timezone/timezone.service';
import { MessageService } from '../message/message.service';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import {
  ImetaPagination,
  IResponsePageWrapper,
} from 'src/utils/types/interface/IResPageWrapper.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenForgotPasswordService } from '../token-forgot-password/token-forgot-password.service';
import { TokenForgotPassword } from '../token-forgot-password/schema/tokenForgotPassword.schema';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userSchema: Model<User>,

    @Inject(CACHE_MANAGER)
    private cacheService: Cache,

    private emailService: EmailService,
    private tokenForgotPasswordService: TokenForgotPasswordService,
    private passwordConfService: PasswordConfService,
    private timezoneService: TimezoneService,
    private messageService: MessageService,
  ) {}

  async createUser(
    registerUserDto: RegisterUserDto,
    role: ERole,
  ): Promise<User> {
    const createdAt: string = this.timezoneService.getTimeZone();
    const updatedAt = createdAt;

    const { name, email, phoneNumber, birthDate, password } = registerUserDto;

    this.messageService.setMessage('Create User Successfully');

    return this.userSchema.create({
      name,
      email,
      phoneNumber,
      role,
      birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
      password: await this.passwordConfService.hashPassword(password),
      createdAt,
      updatedAt,
    });
  }

  async findAllUsers(): Promise<User[]> {
    const cacheKey: string = 'findAllUsers';
    const cachedResult: User[] = await this.cacheService.get<User[]>(cacheKey);

    if (cachedResult) return cachedResult;

    this.messageService.setMessage('Get All Users Successfully');
    const user: User[] = await this.userSchema
      .find({ role: ERole.USER })
      .exec();

    await this.cacheService.set(cacheKey, user);
    return user;
  }

  async findAllUsersPagination(
    page: number,
    limit: number,
    search?: string,
  ): Promise<IResponsePageWrapper<User>> {
    const cacheKey: string = `findAllUsersPagination_${page}_${limit}_${search}`;

    const cachedResult: IResponsePageWrapper<User> =
      await this.cacheService.get<IResponsePageWrapper<User>>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    const query: any = {
      role: ERole.USER,
    };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const totalData = await this.userSchema.countDocuments(query);
    const totalPages = Math.ceil(totalData / limit);
    const offset = (page - 1) * limit;

    const users: User[] = await this.userSchema
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();

    const meta: ImetaPagination = {
      totalPages,
      totalData,
      totalDataPerPage: users.length,
      page,
      limit,
    };

    const response: IResponsePageWrapper<User> = {
      data: users,
      meta,
    };

    await this.cacheService.set(cacheKey, response, 60000);

    this.messageService.setMessage('Get All Users Successfully');
    return response;
  }

  async findUserByGuid(guid: string): Promise<User> {
    const cacheKey: string = `findUserByGuid_${guid}`;
    const cachedResult: User = await this.cacheService.get<User>(cacheKey);

    if (cachedResult) return cachedResult;

    const user: User = await this.userSchema.findOne({ guid });

    if (!user) throw new NotFoundException('User not found');

    await this.cacheService.set(cacheKey, user);

    this.messageService.setMessage('Get User Successfully');
    return user;
  }

  async updateUserByGuid(
    guid: string,
    { name, email, birthDate, phoneNumber }: UpdateUserDto,
  ): Promise<User> {
    const user: User = await this.userSchema.findOneAndUpdate(
      { guid },
      {
        name,
        email,
        birthDate: this.timezoneService.birthDateStringToDateUtc(birthDate),
        phoneNumber,
        createdAt: this.timezoneService.getTimeZone(),
      },
      { new: true },
    );

    if (!user) throw new NotFoundException('User not found');

    await this.cacheService.del(`findUserByGuid_${guid}`);
    return user;
  }

  async updatePassword(
    guid: string,
    { existingPassword, newPassword, confirmPassword }: UpdatePasswordDto,
  ): Promise<void> {
    const user: User = await this.userSchema.findOne({ guid }).exec();

    const isExistingPasswordValid =
      await this.passwordConfService.comparePassword(
        existingPassword,
        user.password,
      );

    if (!isExistingPasswordValid)
      throw new BadRequestException('Existing Password Wrong!');

    await this.updatePasswordByGuid(guid, { newPassword, confirmPassword });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { guid } = await this.userSchema.findOne({
      email: forgotPasswordDto.email,
    });

    const token: string =
      await this.tokenForgotPasswordService.createTokenForgotPassword(guid);

    this.emailService.sendEmailForgotPassword(forgotPasswordDto.email, token);
    this.messageService.setMessage('Send Email Successfully');

    setTimeout(async () => {
      await this.tokenForgotPasswordService.deleteToken(token);
      console.log('Token Expired');
    }, 120000);
  }

  async changeNewPasswordByToken(
    token: string,
    newPasswordDto: NewPasswordDto,
  ): Promise<void> {
    const { userGuid }: TokenForgotPassword =
      await this.tokenForgotPasswordService.findDataByToken(token);

    await this.updatePasswordByGuid(userGuid, newPasswordDto);
    this.messageService.setMessage('Change new Password Successfully');
  }

  async updatePasswordByGuid(
    guid: string,
    { newPassword, confirmPassword }: NewPasswordDto,
  ): Promise<void> {
    if (newPassword !== confirmPassword)
      throw new BadRequestException(
        'New Password and Confirm Password Not Match!',
      );

    await this.userSchema.findOneAndUpdate(
      { guid },
      {
        password: await this.passwordConfService.hashPassword(newPassword),
        updatedAt: this.timezoneService.getTimeZone(),
      },
      { new: true },
    );

    this.messageService.setMessage('Update Password Successfully');
  }

  async deleteUser(guid: string): Promise<void> {
    const deletedUser: User = await this.userSchema.findOneAndDelete({ guid });

    if (!deletedUser) throw new NotFoundException('User Not Found');
    this.messageService.setMessage('Delete User Successfully');
  }

  async validateCredentials(loginDto: LoginDto): Promise<IJwtPayload> {
    const { email, password } = loginDto;

    const user: User = await this.userSchema.findOne({ email });

    if (!user) throw new NotFoundException('User Not Found');

    const isPasswordValid: boolean =
      await this.passwordConfService.comparePassword(password, user.password);

    if (!isPasswordValid) throw new BadRequestException('Password Wrong!');

    const { guid, role }: User = await this.findUserByGuid(user.guid);

    return {
      guid,
      email,
      role,
    };
  }
}
