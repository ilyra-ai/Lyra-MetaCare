export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    /** Cabeçalhos extras da resposta de erro (ex.: `Retry-After` no 429). */
    public readonly headers?: Readonly<Record<string, string>>
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
