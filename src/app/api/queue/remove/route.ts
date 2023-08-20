import { removeSongsFromQueue } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute(async (req, session) => {
  const { queueItemId } = (await req.json()) as { queueItemId: string };
  const result = await removeSongsFromQueue({
    session: session!,
    queueItemIds: [queueItemId],
  });
  return createJsonResponse(result);
});
