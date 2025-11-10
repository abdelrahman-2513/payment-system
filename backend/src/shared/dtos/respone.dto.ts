import { EResponse } from "../enums";

export class ResponseDto<T> {
  status: EResponse;
  message: string;
  data: T | null;
}
