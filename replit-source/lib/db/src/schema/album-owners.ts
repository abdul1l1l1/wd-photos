import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const albumOwnersTable = pgTable("album_owners", {
  albumKey: text("album_key").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAlbumOwnerSchema = createInsertSchema(albumOwnersTable).omit({
  createdAt: true,
});

export type InsertAlbumOwner = z.infer<typeof insertAlbumOwnerSchema>;
export type AlbumOwner = typeof albumOwnersTable.$inferSelect;