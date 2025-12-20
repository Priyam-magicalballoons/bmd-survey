"use server";

import { sql } from "@/lib/db";
import { getIpAddress, withRetry } from "@/lib/helpers";
import { decryptData, encryptData, hashData } from "@/lib/saveTempUserData";
import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

interface PatientData {
  name?: string | undefined;
  age: string;
  one?: string;
  gender: string;
  mobile?: string | undefined;
  height: string;
  weight: string;
  diet: string;
  alcohol: string;
  smoking: string;
  tobacco_chewing: string;
  bmd_score: string;
  history_of_fractures: string;
  fracture_diagnosed: string;
  menopause: string;
  orthopaedic_surgeries: string;
  startTime: Date;
  existing_medical_conditions: {
    copd: string;
    diabetes: string;
    epilepsy: string;
    hypertension: string;
    knee_osteoarthritis: string;
    copd_regular_medicine?: string;
    epilepsy_regular_medicine?: string;
  };
}
// Retry helper

export const savePatient = async (data: PatientData) => {
  try {
    const token = (await cookies()).get("user")?.value;

    if (!token) {
      return { status: 401, message: "Unauthorized: token missing" };
    }

    let coordinator: { id: string; campId: string };
    try {
      coordinator = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        campId: string;
      };
    } catch {
      return { status: 401, message: "Invalid token" };
    }

    const ipAddress = await getIpAddress();

    if (!ipAddress) {
      return {
        status: 400,
        message: "Internal server error",
      };
    }

    const OTPID = randomUUID();
    const patientID = randomUUID();
    const QuestionnaireID = randomUUID();
    const createdAt = data.startTime ?? new Date();

    const retry = await withRetry(async () => {
      const result = await sql.transaction((tx) => [
        // 1️⃣ OTP
        tx`
      INSERT INTO "otp" (id, phone, otp)
      VALUES (
        ${OTPID},
        ${hashData(data.mobile!)},
        ${decryptData(data.one!)}
      )
    `,

        // 2️⃣ Patient
        tx`
      INSERT INTO "Patient" (
        id, name, age, gender, otp, number,
        "coordinatorId", "createdAt", "endedAt", "ipAddress"
      )
      VALUES (
        ${patientID},
        ${encryptData(data.name)},
        ${data.age},
        ${data.gender},
        ${decryptData(data.one!)},
        ${encryptData(data.mobile)},
        ${coordinator.id},
        ${createdAt},
        ${new Date()},
        ${ipAddress}
      )
      RETURNING *
    `,

        // 3️⃣ Questionnaire
        tx`
      INSERT INTO "Questionaire" (
      id,
        alcohol,
        "bmdScore",
        copd,
        diabetes,
        diet,
        epilepsy,
        height,
        "historyOfFractures",
        hypertension,
        "kneeOsteoarthritis",
        "orthopaedicSurgeriesHistory",
        smoking,
        tobacco,
        weight,
        "copdMedication",
        "epilepsyMedication",
        "fractureAge",
        "Menopause",
        "patientId"
      )
      VALUES (
      ${QuestionnaireID},
        ${data.alcohol},
        ${data.bmd_score},
        ${data.existing_medical_conditions.copd},
        ${data.existing_medical_conditions.diabetes},
        ${data.diet},
        ${data.existing_medical_conditions.epilepsy},
        ${data.height},
        ${data.history_of_fractures},
        ${data.existing_medical_conditions.hypertension},
        ${data.existing_medical_conditions.knee_osteoarthritis},
        ${data.orthopaedic_surgeries},
        ${data.smoking},
        ${data.tobacco_chewing},
        ${data.weight},
        ${data.existing_medical_conditions.copd_regular_medicine},
        ${data.existing_medical_conditions.epilepsy_regular_medicine},
        ${data.fracture_diagnosed},
        ${data.menopause},
        ${patientID}
      )
      RETURNING *
    `,
      ]);
      return result;
    });

    (await cookies()).delete("tempData");
    return {
      status: 200,
      message: "Patient Survey Submitted Successfully",
      data: retry,
    };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint violation (duplicate mobile number)
        return {
          status: 409,
          message: "Patient with this mobile number already exists",
        };
      }
      if (error.code === "P2028" || error.code === "P2034") {
        return {
          status: 400,
          message: "Database is busy. Please try again in a few seconds.",
        };
      }
    }
    console.error("Error saving patient:", error);
    return {
      status: 500,
      message: "Internal server error. Please try again later.",
    };
  }
};

export const getPatientNumber = async () => {
  const token = (await cookies()).get("user")?.value;
  if (!token) {
    return {
      status: 400,
      message: "Internal server error",
    };
  }
  const coordinatorId = jwt.decode(token) as { id: string; campId: string };

  const count = await prisma.patient.count({
    where: {
      coordinatorId: coordinatorId.id,
    },
  });

  if (!count) {
    return { status: 400, message: "Error in fetching patient counts" };
  }

  return {
    status: 200,
    data: count,
  };
};
