import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ATPayload } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ATPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
