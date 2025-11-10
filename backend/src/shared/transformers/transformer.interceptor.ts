import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dtos/respone.dto';
import { EResponse } from '../enums';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const requestNumber = uuidv4();
    const date = new Date();
    const formattedDate = date.toISOString();

    return next.handle().pipe(
      map((data) => {
        const { message, data: resData } = data;
        const user = request.user;
        const method = request.method;
        const url = request.url;
        const createdBy = user ? user.email : 'Unknown';
        const statusCode = response.statusCode;

        this.logger.log(
          `[${formattedDate}] Method: ${method} ${statusCode}: URL: ${url}, Request Number: ${requestNumber}, Message: ${message}`,
        );

        const formattedResponse: ResponseDto<T> = {
          status: EResponse.SUCCESS,
          message: message || 'Request processed successfully',
          data: resData,
        };
        return formattedResponse;
      }),
    );
  }
}
