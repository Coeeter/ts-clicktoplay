import { updateQueueSettings } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';
import { RepeatMode } from '@prisma/client';

export const POST = protectedApiRoute(async (req, session) => {
  const body = (await req.json()) as { repeatMode: RepeatMode };
  const result = await updateQueueSettings({
    session: session!,
    repeatMode: body.repeatMode,
  });
  return createJsonResponse(result);
});