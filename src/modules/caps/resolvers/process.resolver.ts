import { UseGuards } from '@nestjs/common';
import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { GqlAuthGuard } from '@modules/common/guards';
import { CurrentUser } from '@modules/common/decorators';
import { User } from '@modules/users/user.entity';

import { Process, Industry } from '../entities';
import { ProcessService, IndustryService } from '../services';
import { ProcessesArgs, ProcessCreationInput, ProcessInput } from '../dto';

@UseGuards(GqlAuthGuard)
@Resolver(() => Process)
export class ProcessResolver {
  constructor(
    private readonly processService: ProcessService,
    private readonly industryService: IndustryService
  ) {}

  @Query(() => [Process])
  async processes(@Args() args: ProcessesArgs) {
    return this.processService.findAll(args);
  }

  @Query(() => Process)
  async treeProcesses(@Args() args: ProcessesArgs) {
    return this.processService.tree(args);
  }

  @Query(() => Process)
  async defaultTreeProcesses(@Args() args: ProcessesArgs) {
    return this.processService.defaultTree(args);
  }

  @Query(() => Process)
  async process(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.processService.findOneById(id);
  }

  @Mutation(() => Process)
  async createProcess(
    @Args({ name: 'data', type: () => ProcessCreationInput }) data: ProcessCreationInput,
    @CurrentUser() user: User
  ) {
    return this.processService.create(data, { user });
  }

  @Mutation(() => Process)
  async saveProcess(
    @Args({ name: 'data', type: () => ProcessInput }) data: ProcessInput,
    @CurrentUser() user: User
  ) {
    return this.processService.save(data.id, data, { user });
  }

  @Mutation(() => [Process])
  async saveProcesses(
    @Args({ name: 'data', type: () => [ProcessInput] }) data: ProcessInput[],
    @CurrentUser() user: User
  ) {
    return this.processService.saveMany(data, { user });
  }

  @Mutation(() => Process)
  async removeProcess(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.processService.remove(id);
  }

  @ResolveProperty('children', () => [Process], { nullable: true })
  async getChildren(@Parent() process: Process) {
    return this.processService.findAll({ parentId: process.id });
  }

  @ResolveProperty('parent', () => Process, { nullable: true })
  async getParent(@Parent() process: Process) {
    return this.processService.findOneById(process.parentId);
  }

  @ResolveProperty('industry', () => Industry, { nullable: true })
  async getIndustry(@Parent() process: Process) {
    return this.industryService.findOneById(process.industry_id);
  }
}
