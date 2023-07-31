import { getServerSession } from '@/lib/auth';
import { ApiError, UnauthorizedError, createErrorResponse } from './response';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

type ApiReturnType =
  | Promise<NextResponse<any> | void>
  | NextResponse<any>
  | void;

export type HandlerType<Params> = (
  req: NextRequest,
  session: Session | null,
  params: Params | null
) => ApiReturnType;

type ErrorHandlerType = (
  e: any,
  req: NextRequest,
  session: Session | null
) => ApiReturnType;

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
    return await onError(e, req, session);
  }
  if (e instanceof ApiError) {
    return e.getResponse();
  }
  return createErrorResponse('Something went wrong', 500);
};

export const protectedApiRoute = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => {
  return async (request: NextRequest, { params }: { params: Params }) => {
    let session: Session | null = null;
    try {
      session = await authChecker();
      return await handler(request, session, params);
    } catch (e) {
      return await errorHandler(e, request, session, onError);
    }
  };
};

export const publicApiRoute = <Params>(
  handler: HandlerType<Params>,
  onError?: ErrorHandlerType
) => {
  return async (request: NextRequest, { params }: { params: Params }) => {
    try {
      return await handler(request, null, params);
    } catch (e) {
      return await errorHandler(e, request, null, onError);
    }
  };
};
