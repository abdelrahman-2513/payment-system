import { EResponse } from "../enums";

export class PaginatedResponseDto<T> {
  status: EResponse;
  message: string;
  data: T[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
