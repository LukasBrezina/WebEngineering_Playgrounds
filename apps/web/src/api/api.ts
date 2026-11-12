export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requestId?: string
  ) {
    super(message);
  }
}

// Error flow: API answers 4xx/5xx with Problem Details -> checkResponseOk throws ApiError(detail, status, requestId)
// -> the component's catch calls errorMessage(e, fallback): ApiError -> detail, anything else (network/CORS) -> fallback
// -> the message is put into the error state and rendered as <p role="alert">.
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

export const errorMessage = (e: unknown, fallback: string): string => {
  if (!(e instanceof ApiError)) return fallback;
  return e.requestId === undefined
    ? e.message
    : `${e.message} (Request ID: ${e.requestId})`;
};
