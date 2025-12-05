import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const userFromRequest = request.user; // quì dentro c'è il Payload decodificato dei JWT passato dal metodo validate(...) delle classi PassportStrategy dedicate ai JWT
    return userFromRequest;
  },
);
