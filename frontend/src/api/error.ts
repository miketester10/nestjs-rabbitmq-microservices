import { AxiosError, isAxiosError } from "axios";

export interface ErrorResponse {
  message: ApiErrorMessage;
  statusCode: number;
}

type ApiError = AxiosError<ErrorResponse>;
type ApiErrorMessage = string | string[] | number;

export const handleError = (err: unknown): string => {
  const defaultErrorMessage = "Si è verificato un errore. Riprova più tardi.";
  if (isAxiosError(err)) {
    const apiErrorMessage = (err as ApiError).response?.data.message;
    if (apiErrorMessage) {
      if (typeof apiErrorMessage === "string") {
        return apiErrorMessage;
      } else if (Array.isArray(apiErrorMessage)) {
        return apiErrorMessage.join(", ");
      } else {
        return String(apiErrorMessage);
      }
    }
  }
  return defaultErrorMessage;
};
