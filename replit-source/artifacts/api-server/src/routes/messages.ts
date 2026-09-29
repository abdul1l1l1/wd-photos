import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth } from "@clerk/express";
import { desc, eq, inArray } from "drizzle-orm";
import { db, albumOwnersTable, contactMessagesTable, contactRepliesTable } from "@workspace/db";
import {
  CreateMessageBody,
  CreateMessageResponse,
  GetConversationParams,
  GetConversationResponse,
  ListMessagesResponse,
  ReplyToMessageBody,
  ReplyToMessageParams,
  ReplyToMessageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const albumKey = "wd-photo-album";
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function requireOwner(req: Request, res: Response): Promise<boolean> {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign-in required" });
    return false;
  }
  const [owner] = await db.select().from(albumOwnersTable).where(eq(albumOwnersTable.albumKey, albumKey)).limit(1);
  if (!owner || owner.ownerUserId !== userId) {
    res.status(403).json({ error: "Only the album owner can view or reply to messages" });
    return false;
  }
  return true;
}

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid name, email, and message" });
    return;
  }
  const { name, email, body } = parsed.data;
  if (!name.trim() || !body.trim()) {
    res.status(400).json({ error: "Name and message cannot be blank" });
    return;
  }
  const token = randomBytes(32).toString("hex");
  const id = randomUUID();
  await db.insert(contactMessagesTable).values({
    id,
    tokenHash: hashToken(token),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    body: body.trim(),
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(201).json(CreateMessageResponse.parse({ id, token }));
});

router.get("/messages", async (req, res): Promise<void> => {
  if (!(await requireOwner(req, res))) return;
  const messages = await db.select().from(contactMessagesTable).orderBy(desc(contactMessagesTable.createdAt));
  const replies = messages.length
    ? await db.select().from(contactRepliesTable)
        .where(inArray(contactRepliesTable.messageId, messages.map((message) => message.id)))
        .orderBy(contactRepliesTable.createdAt)
    : [];
  const payload = messages.map(({ id, name, email, body, createdAt }) => ({
    id, name, email, body, createdAt: createdAt.toISOString(),
    replies: replies.filter((reply) => reply.messageId === id).map(({ id: replyId, body: replyBody, createdAt: replyDate }) => ({
      id: replyId, body: replyBody, createdAt: replyDate.toISOString(),
    })),
  }));
  res.setHeader("Cache-Control", "private, no-store");
  res.json(ListMessagesResponse.parse(payload));
});

router.get("/conversations/:token", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const [message] = await db.select().from(contactMessagesTable)
    .where(eq(contactMessagesTable.tokenHash, hashToken(params.data.token))).limit(1);
  if (!message) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const replies = await db.select().from(contactRepliesTable)
    .where(eq(contactRepliesTable.messageId, message.id)).orderBy(contactRepliesTable.createdAt);
  res.setHeader("Cache-Control", "private, no-store");
  res.json(GetConversationResponse.parse({
    name: message.name, body: message.body, createdAt: message.createdAt.toISOString(),
    replies: replies.map(({ id, body, createdAt }) => ({ id, body, createdAt: createdAt.toISOString() })),
  }));
});

router.post("/messages/:id/replies", async (req, res): Promise<void> => {
  if (!(await requireOwner(req, res))) return;
  const params = ReplyToMessageParams.safeParse(req.params);
  const parsed = ReplyToMessageBody.safeParse(req.body);
  if (!params.success || !parsed.success || !parsed.data.body.trim()) {
    res.status(400).json({ error: "Please enter a valid reply" });
    return;
  }
  const [message] = await db.select({ id: contactMessagesTable.id }).from(contactMessagesTable)
    .where(eq(contactMessagesTable.id, params.data.id)).limit(1);
  if (!message) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const [reply] = await db.insert(contactRepliesTable)
    .values({ id: randomUUID(), messageId: message.id, body: parsed.data.body.trim() }).returning();
  res.setHeader("Cache-Control", "no-store");
  res.status(201).json(ReplyToMessageResponse.parse({
    id: reply.id, body: reply.body, createdAt: reply.createdAt.toISOString(),
  }));
});

export default router;