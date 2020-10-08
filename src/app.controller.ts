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
    const connectedDB = `DB: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
    return 'OK\n' + connectedDB;
  }

  @UseGuards(AuthGuard())
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('me')
  getProfile(@Request() req): Promise<User> {
    return req.user;
  }
}
