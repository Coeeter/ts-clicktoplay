import { moveSongsInQueue } from "@/lib/queue";
import { createJsonResponse, protectedApiRoute } from "@/utils";

export const POST = protectedApiRoute(async (req, session) => {
  const body = await req.json() as {
    songIds: string[];
    nextId: string | null;
    prevId: string | null;
  }
  const result = await moveSongsInQueue({
    session: session!,
    songIds: body.songIds,
    nextId: body.nextId,
    prevId: body.prevId
  })
  return createJsonResponse(result)
})