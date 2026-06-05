/** Standard success envelope returned by the API. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Standard error envelope returned by the API. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Discriminated union of every API response shape. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Health-check payload exposed at `GET /api/health`. */
export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  uptime: number;
  timestamp: string;
  service: string;
  version: string;
  checks: {
    database: "up" | "down";
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}
