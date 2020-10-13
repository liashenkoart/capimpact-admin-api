import { UseGuards,  forwardRef, Inject } from '@nestjs/common';
import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { GqlAuthGuard } from '@modules/common/guards';
import { CurrentUser } from '@modules/common/decorators';
import { User } from '@modules/users/user.entity';

import { Capability } from '../capability.entity';
import { Industry } from '../../industry/industry.entity';
import { Company } from '../../company/company.entity';
import { CapabilityService } from '../services/capability.service';
import { IndustryService } from '../../industry/service/industry.service';
import { CompanyService } from '../../company/services';
import { CapabilitiesArgs, CapabilityCreationInput, CapabilityInput } from '../dto';

@UseGuards(GqlAuthGuard)
@Resolver(() => Capability)
export class CapabilityResolver {
  constructor(
    @Inject(forwardRef(() => CapabilityService))
    private readonly capabilityService: CapabilityService,
    @Inject(forwardRef(() => IndustryService))
    private readonly industryService: IndustryService,
    @Inject(forwardRef(() => CompanyService))
    private readonly companyService: CompanyService
  ) {}

  @Query(() => [Capability])
  async capabilities(@Args() args: CapabilitiesArgs) {
    return this.capabilityService.findAll(args);
  }

  @Query(() => Capability)
  async treeCapabilities(@Args() args: CapabilitiesArgs) {
    return this.capabilityService.tree(args);
  }

  @Query(() => Capability)
  async capability(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.capabilityService.findOneById(id);
  }

  @Mutation(() => Capability)
  async createCapability(
    @Args({ name: 'data', type: () => CapabilityCreationInput }) data: CapabilityCreationInput,
    @CurrentUser() user: User
  ) {
    return this.capabilityService.create(data, { user });
  }

  @Mutation(() => Capability)
  async saveCapability(
    @Args({ name: 'data', type: () => CapabilityInput }) data: CapabilityInput,
    @CurrentUser() user: User
  ) {
    return this.capabilityService.save(data.id, data, { user });
  }

  @Mutation(() => [Capability])
  async saveCapabilities(
    @Args({ name: 'data', type: () => [CapabilityInput] }) data: CapabilityInput[],
    @CurrentUser() user: User
  ) {
    return this.capabilityService.saveMany(data, { user });
  }

  @Mutation(() => Capability)
  async removeCapability(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.capabilityService.remove(id);
  }

  @ResolveProperty('children', () => [Capability], { nullable: true })
  async getChildren(@Parent() capability: Capability) {
    return this.capabilityService.findAll({ parentId: capability.id });
  }

  @ResolveProperty('parent', () => Capability, { nullable: true })
  async getParent(@Parent() capability: Capability) {
    return this.capabilityService.findOneById(capability.parentId);
  }

  @ResolveProperty('industry', () => Industry, { nullable: true })
  async getIndustry(@Parent() capability: Capability) {
    return this.industryService.findOneById(capability.industry_id);
  }

  @ResolveProperty('company', () => Company, { nullable: true })
  async getCompany(@Parent() capability: Capability) {
    return this.companyService.findOneById(capability.industry_id);
  }
}
