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
  error: string,
  status: number = 500,
  responseInit?: ResponseInit
) => {
  return createJsonResponse({ error }, status, responseInit);
};

export const createUnauthorizedResponse = (
  error: string = 'You must be logged in to perform this action',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 401, responseInit);
};

export const createNotFoundResponse = (
  error: string = 'Not found',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 404, responseInit);
};

export const createForbiddenResponse = (
  error: string = 'You are not allowed to perform this action',
  responseInit?: ResponseInit
) => {
  return createErrorResponse(error, 403, responseInit);
};

export class ApiError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
  }

  getResponse() {
    return createErrorResponse(this.message, this.status);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message: string = 'You must be logged in to perform this action'
  ) {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'You are not allowed to perform this action') {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found') {
    super(message, 404);
  }
}
