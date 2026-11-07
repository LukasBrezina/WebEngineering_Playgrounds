export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requestId?: string
  ) {
    super(message);
  }
}

export async function checkResponseOk(res: Response): Promise<Response> {
  if (res.ok) return res;
  const isProblem = (res.headers.get('content-type') ?? '').includes(
    'problem+json'
  );
  const p = (isProblem ? await res.json().catch(() => ({})) : {}) as {
    detail?: string;
  };
  throw new ApiError(
    p.detail ?? `Request failed (${res.status})`,
    res.status,
    res.headers.get('x-request-id') ?? undefined
  );
}

export const errorMessage = (e: unknown, fallback: string): string =>
  e instanceof ApiError ? e.message : fallback;
