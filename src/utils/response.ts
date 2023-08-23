import { NextResponse } from 'next/server';

export const createJsonResponse = (
  json: any,
  status: number = 200,
  responseInit?: ResponseInit
) => {
  responseInit = responseInit ?? {};
  responseInit.status = status;
  responseInit.headers = {
    ...responseInit.headers,
    'Content-Type': 'application/json',
  };

  return new NextResponse(JSON.stringify(json), responseInit);
};

export const createErrorResponse = (
  error: string | { error: any },
  status: number = 500,
  responseInit?: ResponseInit
) => {
  if (typeof error === 'string') {
    error = { error };
  }
  return createJsonResponse(error, status, responseInit);
};

export const createUnauthorizedResponse = (
  error:
    | string
    | { error: any } = 'You must be logged in to perform this action',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 401, responseInit);
};

export const createNotFoundResponse = (
  error: string | { error: any } = 'Not found',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 404, responseInit);
};

export const createForbiddenResponse = (
  error: string | { error: any } = 'You are not allowed to perform this action',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 403, responseInit);
};

export class ApiError extends Error {
  error: string | { error: any };

  constructor(error: string | { error: any }, public status: number = 500) {
    if (typeof error === 'string') {
      error = { error };
    }
    super(error.error);
    this.error = error;
  }

  getResponse() {
    return createErrorResponse(this.error, this.status);
  }
}

export class BadRequestError extends ApiError {
  constructor(error: string | { error: any } = 'Bad request') {
    super(error, 400);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    error:
      | string
      | { error: any } = 'You must be logged in to perform this action'
  ) {
    super(error, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(
    error:
      | string
      | { error: any } = 'You are not allowed to perform this action'
  ) {
    super(error, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(error: string | { error: any } = 'Not found') {
    super(error, 404);
  }
}
