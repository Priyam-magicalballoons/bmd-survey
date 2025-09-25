// producer.ts
"use server";

import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const STREAM_KEY = "patient_events";

export async function producePatientEvent(payload: any, coordinatorId: string) {
  const eventId = nanoid(15);

  // Add to Redis Stream
  const res = await redis.xadd(STREAM_KEY, "*", {
    event_id: eventId,
    payload: JSON.stringify(payload),
    coordinatorId,
    retries: "0",
    // setError: true,
  });

  console.log("📤 Produced:", { eventId, ...payload });
  console.log(res);
  if (res) {
    return {
      status: 200,
      message: res,
    };
  }
}

// Example usage (manual test)
