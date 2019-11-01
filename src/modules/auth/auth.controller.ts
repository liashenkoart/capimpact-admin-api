import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from '@modules/users/user.service';
import { UserCreationInput } from '@modules/users/dto';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  async signup(@Body() data: UserCreationInput) {
    return this.usersService.create(data);
  }
}
