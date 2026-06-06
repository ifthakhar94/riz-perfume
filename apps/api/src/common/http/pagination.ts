import type { Paginated } from "@riz/shared";

export interface PageParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Coerce page/pageSize from a request query into safe pagination params. */
export const getPageParams = (
  query: { page?: unknown; pageSize?: unknown },
  maxPageSize = 100,
): PageParams => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, Number(query.pageSize) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
};

export const buildPaginated = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> => ({
  items,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  },
});
