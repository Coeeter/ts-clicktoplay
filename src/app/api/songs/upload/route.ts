import { createSong, getSongFileUploadUrl } from '@/actions/songs';
import { createSongSchema, getUploadUrlSchema } from '@/schema/song';
import { extractSearchParams, protectedApiRoute, zodParse } from '@/utils';

export const GET = protectedApiRoute(async req => ({
  body: {
    url: await getSongFileUploadUrl(
      zodParse(getUploadUrlSchema)(extractSearchParams(req.url))
    ),
  },
}));

export const POST = protectedApiRoute(async (req, session) => ({
  status: 201,
  body: {
    id: await createSong({
      session: session!,
      ...zodParse(createSongSchema)(await req.json()),
    }),
  },
}));
