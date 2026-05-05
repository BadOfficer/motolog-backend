export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
}
