export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function getHttpErrorStatus(
  error: unknown,
  fallbackStatus = 500
): number {
  return error instanceof HttpError ? error.statusCode : fallbackStatus;
}
