import { getQueue, updateCurrentSongInQueue } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const PUT = protectedApiRoute(async (req, session) => {
  const queue = await getQueue(session!);
  const body = (await req.json()) as {
    currentlyPlayingId?: string;
  };
  if (body.currentlyPlayingId === undefined) {
    throw new Error('Currently playing id required');
  }
  if (!queue.items.find(item => item.id === body.currentlyPlayingId)) {
    throw new Error('Song not found in queue');
  }
  const result = await updateCurrentSongInQueue({
    session: session!,
    currentQueueItemId: body.currentlyPlayingId,
  });
  return createJsonResponse(result);
});
