import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ID, Int } from 'type-graphql';

import { Industry } from '../entities';
import { IndustryService } from '../services';
import { IndustriesArgs, IndustryCreationInput, IndustryInput } from '../dto';

@Resolver(() => Industry)
export class IndustryResolver {
  constructor(private readonly industryService: IndustryService) {}

  @Query(() => [Industry])
  async industries(@Args() args: IndustriesArgs) {
    return this.industryService.findAll(args);
  }

  @Query(() => Industry)
  async industry(@Args({ name: 'id', type: () => ID }) id: number) {
    return this.industryService.findById(id);
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

}
