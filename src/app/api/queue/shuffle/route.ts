import { updateQueueSettings } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';

export const POST = protectedApiRoute(
  async (req, session) => {
    const body = (await req.json()) as {
      shuffle: boolean;
      newItems: string[];
    };
    await updateQueueSettings({
      session: session!,
      isShuffled: body.shuffle,
      newOrder: body.newItems,
    });
    return createJsonResponse({
      message: 'Shuffle updated',
    });
  }
);
