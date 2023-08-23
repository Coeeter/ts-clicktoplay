import { getServerSession } from '@/lib/auth';
import {
  ApiError,
  UnauthorizedError,
  createErrorResponse,
  createJsonResponse,
} from './response';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

type ApiReturnType = {
  status?: number;
  headers?: Record<string, string>;
  body: any;
} | void;

export type HandlerType<Params> = (
  req: NextRequest,
  session: Session | null,
  params: Params | null
) => ApiReturnType | Promise<ApiReturnType>;

type ErrorHandlerType = (
  e: any,
  req: NextRequest,
  session: Session | null
) => ApiReturnType | Promise<ApiReturnType>;

type ProtectedApiRouteType = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => (
  request: NextRequest,
  params: { params: Params }
) => Promise<NextResponse<any> | void>;

type PublicApiRouteType = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => (
  request: NextRequest,
  params: { params: Params }
) => Promise<NextResponse<any> | void>;

const authChecker = async () => {
  const session = await getServerSession();
  if (!session?.user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }
  return session;
};

const errorHandler = async (
  e: any,
  req: NextRequest,
  session: Session | null,
  onError?: ErrorHandlerType
) => {
  console.log(e);
  if (onError) {
    const result = await onError(e, req, session);
    if (result) {
      return createJsonResponse(result.body, result.status, {
        headers: result.headers,
      });
    }
  }
  if (e instanceof ApiError) {
    return e.getResponse();
  }
  return createErrorResponse('Something went wrong', 500);
};

export const protectedApiRoute: ProtectedApiRouteType = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => {
  return async (request: NextRequest, { params }: { params: Params }) => {
    let session: Session | null = null;
    try {
      session = await authChecker();
      const result = await handler(request, session, params);
      if (!result) return new NextResponse(null, { status: 204 });
      return createJsonResponse(result.body, result.status, {
        headers: result.headers,
      });
    } catch (e) {
      return await errorHandler(e, request, session, onError);
    }
  };
};

export const publicApiRoute: PublicApiRouteType = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => {
  return async (request: NextRequest, { params }: { params: Params }) => {
    try {
      const result = await handler(request, null, params);
      if (!result) return new NextResponse(null, { status: 204 });
      return createJsonResponse(result.body, result.status, {
        headers: result.headers,
      });
    } catch (e) {
      return await errorHandler(e, request, null, onError);
    }
  };
};
