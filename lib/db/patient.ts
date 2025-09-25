// lib/db/patient.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function savePatientToDB(payload: any) {
  try {
    const data = typeof payload === "string" ? JSON.parse(payload) : payload;

    return await prisma.patient.create({
      data,
    });
  } catch (err: any) {
    console.error("❌ Failed to save patient:", err.message);
    throw err;
  }
}
