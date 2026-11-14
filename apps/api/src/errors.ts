export class HttpError extends Error {
  constructor(
    public status: number,
    public title: string,
    detail = title
  ) {
    super(detail);
  }
}
export class NotFoundError extends HttpError {
  constructor(obj: string) {
    super(404, 'Not Found', `${obj} not found`);
  }
}
export class UpstreamError extends HttpError {
  constructor(detail = 'Upstream request failed') {
    super(502, 'Bad Gateway', detail);
  }
}
export class UpstreamTimeoutError extends HttpError {
  constructor() {
    super(504, 'Gateway Timeout', 'Upstream did not respond in time');
  }
}
export class ServiceUnavailableError extends HttpError {
  constructor(detail = 'Service unavailable') {
    super(503, 'Service Unavailable', detail);
  }
}
