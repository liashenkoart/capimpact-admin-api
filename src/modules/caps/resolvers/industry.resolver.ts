import { UseGuards } from '@nestjs/common';
import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { GqlAuthGuard } from '@modules/common/guards';

import { Industry, Process, Capability, Company } from '@modules/caps/entities';
import {
  IndustryService,
  ProcessService,
  CapabilityService,
  CompanyService,
} from '@modules/caps/services';
import { IndustriesArgs, IndustryCreationInput, IndustryInput } from '@modules/caps/dto';

@UseGuards(GqlAuthGuard)
@Resolver(() => Industry)
export class IndustryResolver {
  constructor(
    private readonly industryService: IndustryService,
    private readonly processService: ProcessService,
    private readonly capabilityService: CapabilityService,
    private readonly companyService: CompanyService
  ) {}

  @Query(() => [Industry])
  async industries(@Args() args: IndustriesArgs) {
    return this.industryService.findAll(args);
  }

  @Query(() => Industry)
  async industry(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.industryService.findOneById(id);
  }

  @Mutation(() => Industry)
  async createIndustry(@Args('data') data: IndustryCreationInput) {
    return this.industryService.create(data);
  }

  @Mutation(() => Industry)
  async saveIndustry(@Args('data') data: IndustryInput) {
    return this.industryService.save(data.id, data);
  }

  @Mutation(() => [Industry])
  async saveIndustries(@Args({ name: 'data', type: () => [IndustryInput] }) data: IndustryInput[]) {
    return this.industryService.saveMany(data);
  }

  @Mutation(() => Industry)
  async cloneIndustry(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args('data') data: IndustryCreationInput
  ) {
    return this.industryService.clone(id, data);
  }

  @Mutation(() => Industry)
  async removeIndustry(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.industryService.remove(id);
  }

  @ResolveProperty('processes', () => [Process], { nullable: true })
  async getProcesses(@Parent() industry: Industry) {
    return this.processService.findAll({ industry_id: industry.id });
  }

  @ResolveProperty('capabilities', () => [Capability], { nullable: true })
  async getCapabilities(@Parent() industry: Industry) {
    return this.capabilityService.findAll({ industry_id: industry.id });
  }

  @ResolveProperty('companies', () => [Company], { nullable: true })
  async getCompanies(@Parent() industry: Industry) {
    return this.companyService.findAll({ industry_id: industry.id });
  }
}
