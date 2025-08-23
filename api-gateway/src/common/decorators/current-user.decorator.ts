import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<Request>();
    const userFromRequest = request.user as JwtPayload; // quì dentro c'è il Payload decodificato passato dalla funzione validate(...) della classe JwtStrategy
    return userFromRequest;
  },
);
