import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "../config/constants";

export type PaginationQuery = {
  page?: number | string;
  limit?: number | string;
};

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page ?? DEFAULT_PAGE), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? DEFAULT_LIMIT), 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
};

export const buildPaginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit)
});
