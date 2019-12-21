import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { Industry, Process, Capability } from '../entities';
import { IndustryService, ProcessService, CapabilityService } from '../services';
import { IndustriesArgs, IndustryCreationInput, IndustryInput } from '../dto';

@Resolver(() => Industry)
export class IndustryResolver {
  constructor(
    private readonly industryService: IndustryService,
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService
  ) {}

  @Query(() => [Industry])
  async industries(@Args() args: IndustriesArgs) {
    return this.industryService.findAll(args);
  }

  @Query(() => Industry)
  async industry(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.industryService.findById(id);
  }

  @ResolveProperty('processes', () => [Process])
  async getProcesses(@Parent() industry: Industry) {
    return this.processService.findAll({ industry_id: industry.id });
  }

  @ResolveProperty('capabilities', () => [Capability])
  async getcapabilities(@Parent() industry: Industry) {
    return this.capabilityService.findAll({ industry_id: industry.id });
  }

  @Mutation(() => Industry)
  async createIndustry(@Args('data') data: IndustryCreationInput) {
    return this.industryService.create(data, {});
  }

  @Mutation(() => Industry)
  async saveIndustry(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args('data') data: IndustryInput
  ) {
    return this.industryService.save(id, data);
  }

  @Mutation(() => Industry)
  async cloneIndustry(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args('data') data: IndustryCreationInput
  ) {
    return this.industryService.save(id, data);
  }

  @Mutation(() => Industry)
  async removeIndustry(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.industryService.remove(id);
  }
}
