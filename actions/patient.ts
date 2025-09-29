"use server";

import { withRetry } from "@/lib/helpers";
import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface PatientData {
  name?: string | undefined;
  age: string;
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

    const result = await withRetry(async () =>
      prisma.$transaction(async (prisma) => {
        const patient = await prisma.patient.create({
          data: {
            name: data.name,
            age: data.age,
            gender: data.gender,
            number: data.mobile!,
            coordinatorId: coordinator.id,
          },
        });

        const questionnaire = await prisma.questionaire.create({
          data: {
            alcohol: data.alcohol,
            bmdScore: data.bmd_score,
            copd: data.existing_medical_conditions.copd,
            diabetes: data.existing_medical_conditions.diabetes,
            diet: data.diet,
            epilepsy: data.existing_medical_conditions.epilepsy,
            height: data.height,
            historyOfFractures: data.history_of_fractures,
            hypertension: data.existing_medical_conditions.hypertension,
            kneeOsteoarthritis:
              data.existing_medical_conditions.knee_osteoarthritis,
            orthopaedicSurgeriesHistory: data.orthopaedic_surgeries,
            smoking: data.smoking,
            tobacco: data.tobacco_chewing,
            weight: data.weight,
            copdMedication:
              data.existing_medical_conditions.copd_regular_medicine,
            epilepsyMedication:
              data.existing_medical_conditions.epilepsy_regular_medicine,
            fractureAge: data.fracture_diagnosed,
            Menopause: data.menopause,
            patientId: patient.id,
          },
        });
        return { patient, questionnaire };
      })
    );

    return {
      status: 200,
      message: "Patient and questionnaire saved successfully",
      data: result,
    };
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2028") {
        // Transaction API timeout
        return {
          status: 400,
          message: "Database is busy. Please try again in a few seconds.",
        };
      }
    }

    // Other errors
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
