import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { Process, Industry } from '../entities';
import { ProcessService, IndustryService } from '../services';
import { ProcessArgs, ProcessCreationInput, ProcessInput } from '../dto';

@Resolver(() => Process)
export class ProcessResolver {
  constructor(
    private readonly processService: ProcessService,
    private readonly industryService: IndustryService
  ) {}

  @Query(() => [Process])
  async processes(@Args() args: ProcessArgs) {
    return this.processService.findAll(args);
  }

  @Query(() => Process)
  async process(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.processService.findById(id);
  }

  @ResolveProperty('children', () => [Process])
  async getChildren(@Parent() process: Process) {
    return this.processService.findAll({ parentId: process.id });
  }

  @ResolveProperty('parent', () => Process)
  async getParent(@Parent() process: Process) {
    return this.processService.findById(process.parentId);
  }

  @ResolveProperty('industry', () => Industry)
  async getIndustry(@Parent() process: Process) {
    return this.industryService.findById(process.industry_id);
  }

  @Mutation(() => Process)
  async createProcess(
    @Args({ name: 'data', type: () => ProcessCreationInput }) data: ProcessCreationInput
  ) {
    return this.processService.create(data, {});
  }

  @Mutation(() => Process)
  async saveProcess(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args({ name: 'data', type: () => ProcessInput }) data: ProcessInput
  ) {
    return this.processService.save(id, data, {});
  }

  @Mutation(() => [Process])
  async saveProcesses(@Args({ name: 'data', type: () => [ProcessInput] }) data: ProcessInput[]) {
    return this.processService.saveMany(data, {});
  }

  @Mutation(() => Process)
  async removeProcess(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.processService.remove(id);
  }
}
