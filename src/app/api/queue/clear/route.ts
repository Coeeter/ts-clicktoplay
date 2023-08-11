import { clearQueue } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute(async (req, session) => {
  const result = await clearQueue({
    session: session!,
  });
  return createJsonResponse(result);
});
