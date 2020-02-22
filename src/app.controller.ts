import {
  Get,
  Controller,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from '@modules/users/user.entity';

@Controller()
export class AppController {
  @Get('/')
  health() {
    return 'OK';
  }

  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  getProfile(@Request() req): Promise<User> {
    return req.user;
  }
}
