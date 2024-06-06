import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register.dto';
import User from './schema/user.schema';
import { JwtAuthGuard } from 'src/guard/jwt-auth/jwt-auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/decorator/Roles.decorator';
import { ERole } from 'src/utils/types/enum/ERole.enum';
import { IResponsePageWrapper } from 'src/utils/types/interface/IResPageWrapper.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { IJwtPayload } from 'src/utils/types/interface/IJwtPayload.interface';
import { UserDec } from 'src/decorator/User.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register/super-admin')
  registerSuperAdminHandler(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<User> {
    return this.userService.createUser(registerUserDto, ERole.SUPER_ADMIN);
  }

  @Post('register/admin')
  registerAdminHandler(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<User> {
    return this.userService.createUser(registerUserDto, ERole.ADMIN);
  }

  @Post('register')
  registerUserHandler(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.userService.createUser(registerUserDto, ERole.USER);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  findAllUsersHandler(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get('pagination')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  findAllUserPaginationHandler(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('search') search: string,
  ): Promise<IResponsePageWrapper<User>> {
    return this.userService.findAllUsersPagination(page, limit, search);
  }

  @Get(':guid')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  findUserByGuidHandler(@Param('guid') guid: string): Promise<User> {
    return this.userService.findUserByGuid(guid);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  findProfileHandler(@UserDec() user: IJwtPayload): Promise<User> {
    return this.userService.findUserByGuid(user.guid);
  }

  @Post('forgot-password')
  forgotPasswordHandler(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    return this.userService.forgotPassword(forgotPasswordDto);
  }

  @Put('profile/update')
  @UseGuards(JwtAuthGuard)
  updateProfileHandler(
    @UserDec() user: IJwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserByGuid(user.guid, updateUserDto);
  }

  @Put(':guid/update')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  updateProfileByAuthorityHandler(
    @Param('guid') guid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserByGuid(guid, updateUserDto);
  }

  @Put('update-password-by-token/:token')
  updatePasswordByTokenHandler(
    @Param('token') token: string,
    @Body() newPasswordDto: NewPasswordDto,
  ): Promise<void> {
    return this.userService.changeNewPasswordByToken(token, newPasswordDto);
  }

  @Put('update-password')
  @UseGuards(JwtAuthGuard)
  updatePasswordHandler(
    @UserDec() user: IJwtPayload,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    return this.userService.updatePassword(user.guid, updatePasswordDto);
  }

  @Delete(':guid')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ERole.ADMIN, ERole.SUPER_ADMIN)
  deleteUserHandler(@Param('guid') guid: string): Promise<void> {
    return this.userService.deleteUser(guid);
  }
}
