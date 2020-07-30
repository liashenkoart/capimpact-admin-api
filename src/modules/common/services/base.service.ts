import { FindManyOptions, Like } from 'typeorm';
import { fromPairs } from 'lodash';

export abstract class BaseService {
  protected getFindAllQuery(query: any): FindManyOptions {
    const { page, skip, limit, sort, ...where } = query;
    const transformedWhere = {};
    Object.entries(where).map(([key, value]) => {
      const isTemplate = typeof value == 'string' && (value.startsWith('%') || value.endsWith('%'));
      transformedWhere[key] = isTemplate ? Like(value) : value;
    });
    return {
      skip: skip > 0 ? skip : (page - 1) * limit,
      take: limit,
      order: sort ? fromPairs([sort]) : {},
      where: transformedWhere,
    };
  }
}
