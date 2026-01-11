import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchFields: string[]) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query }; // copy

    // Filtering
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

    excludeFields.forEach((el) => delete queryObj[el]);

    const filters: FilterQuery<T> = {};

    Object.entries(queryObj).forEach(([key, value]) => {
      const operatorMatch = key.match(/^(.+?)\[(.+)\]$/);
      if (operatorMatch) {
        const [, field, operator] = operatorMatch;
        if (!filters[field as keyof T]) {
          filters[field as keyof T] = {} as any;
        }
        let parsedValue: any = value;
        // Attempt to parse value for numeric/date operators
        if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            parsedValue = numValue;
          } else {
            // Assume date if not number
            const dateValue = new Date(value as string);
            if (!isNaN(dateValue.getTime())) {
              parsedValue = dateValue;
            }
          }
        }
        (filters[field as keyof T] as any)[`$${operator}`] = parsedValue;
      } else {
        (filters as any)[key] = value;
      }
    });

    this.modelQuery = this.modelQuery.find(filters);

    return this;
  }

  sort() {
    const sort =
      (this?.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);

    return this;
  }

  paginate() {
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  fields() {
    const fields =
      (this?.query?.fields as string)?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;