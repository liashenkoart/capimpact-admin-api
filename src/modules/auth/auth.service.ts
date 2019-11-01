import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '@modules/users/users.service';

import passwordCrypt from '@lib/passwordCrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, candidatePassword: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && passwordCrypt.verify(candidatePassword, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = await this.getJwtPayload(user);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getJwtPayload(user: any) {
    return { userId: user.id, email: user.email, roles: ['client'] };
  }
}
