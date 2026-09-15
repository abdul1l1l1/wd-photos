import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, albumOwnersTable } from "@workspace/db";
import {
  GetAlbumResponse,
  SyncAlbumBody,
  SyncAlbumResponse,
} from "@workspace/api-zod";
import {
  readAlbumFromGitHub,
  saveAlbumToGitHub,
} from "../lib/githubAlbum";

const router: IRouter = Router();
const ALBUM_KEY = "wd-photo-album";

async function getOwnerId(): Promise<string | null> {
  const [owner] = await db
    .select()
    .from(albumOwnersTable)
    .where(eq(albumOwnersTable.albumKey, ALBUM_KEY))
    .limit(1);
  return owner?.ownerUserId ?? null;
}

router.get("/album", async (req, res): Promise<void> => {
  try {
    const album = await readAlbumFromGitHub();
    const ownerUserId = await getOwnerId();
    const userId = getAuth(req).userId;

    res.json(
      GetAlbumResponse.parse({
        ...album,
        canEdit: Boolean(userId && (!ownerUserId || ownerUserId === userId)),
        ownerClaimed: Boolean(ownerUserId),
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to load the GitHub album");
    res.status(502).json({ error: "Unable to load the saved GitHub album" });
  }
});

router.put("/album", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign-in required" });
    return;
  }

  const parsed = SyncAlbumBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    await db
      .insert(albumOwnersTable)
      .values({ albumKey: ALBUM_KEY, ownerUserId: userId })
      .onConflictDoNothing();

    const ownerUserId = await getOwnerId();
    if (ownerUserId !== userId) {
      res.status(403).json({ error: "Only the album owner can save changes" });
      return;
    }

    const album = await saveAlbumToGitHub(parsed.data);
    res.json(
      SyncAlbumResponse.parse({
        ...album,
        canEdit: true,
        ownerClaimed: true,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Unable to sync the album to GitHub");
    res.status(502).json({
      error: error instanceof Error ? error.message : "Unable to save to GitHub",
    });
  }
});

export default router;