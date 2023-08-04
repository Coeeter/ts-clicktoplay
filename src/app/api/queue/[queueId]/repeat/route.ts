import { updateQueueSettings } from '@/lib/queue';
import { createJsonResponse, protectedApiRoute } from '@/utils';
import { RepeatMode } from '@prisma/client';

export const POST = protectedApiRoute<{ queueId: string }>(
  async (req, session, params) => {
    const body = (await req.json()) as { repeatMode: RepeatMode };
    await updateQueueSettings({
      session: session!,
      repeatMode: body.repeatMode,
    });
    return createJsonResponse({
      message: 'Repeat mode updated',
    });
  }
);
