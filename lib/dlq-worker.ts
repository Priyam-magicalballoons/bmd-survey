"use server";

import { Redis } from "@upstash/redis";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const STREAM_KEY = "patient_events:dlq";

// const prisma = new PrismaClient({
//   dataSources: { db: { url: process.env.DATABASE_URL_DIRECT } },
// });

type StreamMessage = {
  id: string;
  message: Record<string, string>;
};

async function startWorker() {
  console.log("🚀 Worker started, polling for events...");
  let lastId = "0";

  while (true) {
    try {
      const rawRes = await redis.xread([STREAM_KEY], [lastId], { count: 1 });

      if (!rawRes) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      for (const streamArr of rawRes as unknown as [
        string,
        [string, string[]][]
      ][]) {
        const messagesRaw = streamArr[1];

        const messages: StreamMessage[] = messagesRaw.map(
          ([id, fieldsArray]) => {
            const message: Record<string, string> = {};
            for (let i = 0; i < fieldsArray.length; i += 2) {
              message[fieldsArray[i]] = fieldsArray[i + 1];
            }
            return { id, message };
          }
        );

        for (const message of messages) {
          const id = message.id;
          const fields = message.message;

          console.log("📥 Received:", id, fields);

          const eventId = fields.event_id;
          if (!eventId) {
            console.warn("⚠️ Missing event_id, skipping", id);
            lastId = id; // still advance so we don’t block forever
            continue;
          }

          const retries = parseInt(fields.retries || "0");

          try {
            // Example: simulate DB insert
            if (!fields.setError) {
              throw new Error("Generated error for testing");
            }

            // await prisma.patient.create({ data: {...} });
            console.log("✅ Inserted into DB:", eventId);

            // Remove from main stream on success
            await redis.xdel(STREAM_KEY, id);

            // ✅ only update lastId after success
            lastId = id;
          } catch (err: any) {
            console.error("❌ DB insert failed:", err.message);

            if (retries < 4) {
              console.warn(`🔄 Retrying ${eventId}, attempt ${retries + 1}`);

              await redis.xadd(STREAM_KEY, "*", {
                ...fields,
                retries: (retries + 1).toString(),
              });

              // Remove old copy
              await redis.xdel(STREAM_KEY, id);

              // ✅ advance lastId AFTER re-add
              lastId = id;
            } else {
              console.error("⚠️ Dropping after 5 retries:", eventId);

              await redis.xadd(STREAM_KEY, "*", {
                ...fields,
                original_id: id,
                failed_at: new Date().toISOString(),
                error: "unknown error",
              });

              await redis.xdel(STREAM_KEY, id);

              // ✅ advance lastId AFTER moving to DLQ
              lastId = id;
            }
          }
        }
      }
    } catch (err: any) {
      console.error("❌ Worker error:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

startWorker().catch(console.error);
