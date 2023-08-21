import { updateCurrentSongInQueue } from '@/actions/queue';
import { updateCurrentlyPlayingSongSchema } from '@/schema/queue';
import { protectedApiRoute, zodParse } from '@/utils';

export const PUT = protectedApiRoute(async (req, session) => {
  const body = zodParse(updateCurrentlyPlayingSongSchema)(await req.json());
  return {
    body: await updateCurrentSongInQueue({
      session: session!,
      currentQueueItemId: body.currentlyPlayingId,
    }),
  };
});
