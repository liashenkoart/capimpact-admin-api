import { Resolver, ResolveProperty, Parent, Query, Args, Mutation } from '@nestjs/graphql';
import { ID } from 'type-graphql';

import { Capability, Industry } from '../entities';
import { CapabilityService, IndustryService } from '../services';
import { CapabilitiesArgs, CapabilityCreationInput, CapabilityInput } from '../dto';

@Resolver(() => Capability)
export class CapabilityResolver {
  constructor(
    private readonly capabilityService: CapabilityService,
    private readonly industryService: IndustryService
  ) {}

  @Query(() => [Capability])
  async capabilities(@Args() args: CapabilitiesArgs) {
    return this.capabilityService.findAll(args);
  }

  @Query(() => Capability)
  async capability(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.capabilityService.findById(id);
  }

  @ResolveProperty('children', () => [Capability])
  async getChildren(@Parent() capability: Capability) {
    return this.capabilityService.findAll({ parentId: capability.id });
  }

  @ResolveProperty('parent', () => Capability)
  async getParent(@Parent() capability: Capability) {
    return this.capabilityService.findById(capability.parentId);
  }

  @ResolveProperty('industry', () => Industry)
  async getIndustry(@Parent() capability: Capability) {
    return this.industryService.findById(capability.industry_id);
  }

  @Mutation(() => Capability)
  async createCapability(
    @Args({ name: 'data', type: () => CapabilityCreationInput }) data: CapabilityCreationInput
  ) {
    return this.capabilityService.create(data, {});
  }

  @Mutation(() => Capability)
  async saveCapability(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args({ name: 'data', type: () => CapabilityInput }) data: CapabilityInput
  ) {
    return this.capabilityService.save(id, data, {});
  }

  @Mutation(() => [Capability])
  async saveCapabilities(
    @Args({ name: 'data', type: () => [CapabilityInput] }) data: CapabilityInput[]
  ) {
    return this.capabilityService.saveMany(data, {});
  }

  @Mutation(() => Capability)
  async removeCapability(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.capabilityService.remove(id);
  }
}
