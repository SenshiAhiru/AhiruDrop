-- Support tickets: add category column
ALTER TABLE "support_tickets"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'outro';

-- New table for ticket messages (chat history)
CREATE TABLE IF NOT EXISTS "support_messages" (
  "id"           TEXT PRIMARY KEY,
  "ticketId"    TEXT NOT NULL,
  "senderId"    TEXT,
  "senderRole"  TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "readByUser"  BOOLEAN NOT NULL DEFAULT FALSE,
  "readByAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_messages_ticket_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE,
  CONSTRAINT "support_messages_sender_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "support_messages_ticketId_idx" ON "support_messages"("ticketId");
CREATE INDEX IF NOT EXISTS "support_messages_senderId_idx" ON "support_messages"("senderId");

-- Backfill: for each existing ticket, create a message with the original .message
-- (so new chat UI shows the opener's first message correctly)
INSERT INTO "support_messages" ("id", "ticketId", "senderId", "senderRole", "body", "readByUser", "readByAdmin", "createdAt")
SELECT
  'msg_' || substr(md5(random()::text || id), 1, 20) AS id,
  id AS "ticketId",
  "userId" AS "senderId",
  'USER' AS "senderRole",
  "message" AS body,
  TRUE AS "readByUser",
  FALSE AS "readByAdmin",
  "createdAt"
FROM "support_tickets"
WHERE NOT EXISTS (
  SELECT 1 FROM "support_messages" sm WHERE sm."ticketId" = "support_tickets"."id"
);
