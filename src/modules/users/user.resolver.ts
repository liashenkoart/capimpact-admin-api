import { NotFoundException } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { User } from './user.entity';
import { UsersService } from './user.service';
import { UsersArgs } from './dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  async users(@Args() args: UsersArgs): Promise<User[]> {
    return await this.usersService.findAll(args);
  }

  @Query(() => User)
  async user(@Args({ name: 'id', type: () => ID }) id: number): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }
}
