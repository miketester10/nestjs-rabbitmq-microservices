import { HttpExceptionBodyMessage } from '@nestjs/common';

interface ResponseBase<T = string> {
  message: T;
  statusCode: number;
}

export interface ResponseSuccess<T> extends ResponseBase {
  data?: T; // può essere undefined perche' non tutti gli endpoint sono obbligati a restituire dati
}

export type ResponseError = ResponseBase<HttpExceptionBodyMessage>;
