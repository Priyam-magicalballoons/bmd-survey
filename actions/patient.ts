"use server";

import { prisma } from "@/prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const savePatient = async (data: any) => {
  console.log("data", data);

  const token = (await cookies()).get("user")?.value;
  if (!token) {
    return {
      status: 400,
      message: "Internal server error",
    };
  }

  const coordinatorId = jwt.decode(token) as { id: string; campId: string };

  const createPatient = await prisma.patient.create({
    data: {
      age: data.age,
      gender: data.gender,
      number: data.mobile,
      coordinatorId: coordinatorId.id,
      name: data.name,
    },
  });

  const createdata = await prisma.questionaire.create({
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
      kneeOsteoarthritis: data.existing_medical_conditions.knee_osteoarthritis,
      orthopaedicSurgeriesHistory: data.orthopaedic_surgeries,
      smoking: data.smoking,
      tobacco: data.tobacco_chewing,
      weight: data.weight,
      copdMedication: data.existing_medical_conditions.copd_regular_medicine,
      epilepsyMedication:
        data.existing_medical_conditions.epilepsy_regular_medicine,
      fractureAge: data.fracture_diagnosed,
      Menopause: data.menopause,
      patientId: createPatient.id,
    },
  });

  if (createdata && createPatient) {
    return {
      status: 200,
      message: "Patient recorded successfully",
    };
  } else {
    throw new Error("Error in saving data");
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

  return {
    status: 200,
    data: count,
  };
};
