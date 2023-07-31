import { getUpdateFileUploadUrl, updateSong } from '@/lib/songs';
import {
  createJsonResponse,
  extractSearchParams,
  protectedApiRoute,
} from '@/utils';

export const GET = protectedApiRoute<{ id: string }>(
  async (req, session, params) => {
    const url = await getUpdateFileUploadUrl({
      ...extractSearchParams(req.url),
      id: params?.id,
      session: session!,
    });
    return createJsonResponse({ url });
  }
);

export const PUT = protectedApiRoute<{ id: string }>(
  async (req, session, params) => {
    const result = await updateSong({
      ...(await req.json()),
      id: params?.id,
      session: session!,
    });
    return createJsonResponse(result);
  }
);
