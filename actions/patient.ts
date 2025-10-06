"use server";

import { withRetry } from "@/lib/helpers";
import { encryptData } from "@/lib/saveTempUserData";
import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

    const count = await prisma.patient.count({
      where: {
        coordinatorId: coordinator.id,
      },
    });

    const nextPatientId = `${coordinator.campId}_${String(count + 1).padStart(
      3,
      "0"
    )}`;

    const result = await withRetry(async () =>
      prisma.$transaction(async (prismaTx) => {
        // Always create a new patient (DB will enforce uniqueness on number)
        await prismaTx.otp.create({
          data: {
            phone: data.mobile!,
            otp: data.one!,
          },
        });
        const patient = await prismaTx.patient.create({
          data: {
            name: encryptData(data.name),
            age: data.age,
            gender: data.gender,
            otp: data.one!,
            patientId: nextPatientId,
            number: encryptData(data.mobile), // must be unique at DB level
            coordinatorId: coordinator.id,
          },
        });

        // Directly create questionnaire linked to patient
        const questionnaire = await prismaTx.questionaire.create({
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

// export const savePatient = async (data: PatientData) => {
//   try {
//     // --- 1. Auth ---
//     const token = (await cookies()).get("user")?.value;
//     if (!token) {
//       return { status: 401, message: "Unauthorized: token missing" };
//     }

//     let coordinator: { id: string; campId: string };
//     try {
//       coordinator = jwt.verify(token, process.env.JWT_SECRET!) as {
//         id: string;
//         campId: string;
//       };
//     } catch {
//       return { status: 401, message: "Invalid token" };
//     }

//     // --- 2. Save with retry ---
//     const result = await withRetry(async () => {
//       return prisma.patient.create({
//         data: {
//           name: data.name,
//           age: data.age,
//           gender: data.gender,
//           number: data.mobile!,
//           coordinatorId: coordinator.id,
//           // Nested create instead of separate transaction
//           questionaire: {
//             create: {
//               alcohol: data.alcohol,
//               bmdScore: data.bmd_score,
//               copd: data.existing_medical_conditions.copd,
//               diabetes: data.existing_medical_conditions.diabetes,
//               diet: data.diet,
//               epilepsy: data.existing_medical_conditions.epilepsy,
//               height: data.height,
//               historyOfFractures: data.history_of_fractures,
//               hypertension: data.existing_medical_conditions.hypertension,
//               kneeOsteoarthritis:
//                 data.existing_medical_conditions.knee_osteoarthritis,
//               orthopaedicSurgeriesHistory: data.orthopaedic_surgeries,
//               smoking: data.smoking,
//               tobacco: data.tobacco_chewing,
//               weight: data.weight,
//               copdMedication:
//                 data.existing_medical_conditions.copd_regular_medicine,
//               epilepsyMedication:
//                 data.existing_medical_conditions.epilepsy_regular_medicine,
//               fractureAge: data.fracture_diagnosed,
//               Menopause: data.menopause,
//             },
//           },
//         },
//         include: { questionaire: true },
//       });
//     });

//     return {
//       status: 200,
//       message: "Patient and questionnaire saved successfully",
//       data: result,
//     };
//   } catch (error: any) {
//     // --- 3. Known Prisma errors ---
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2028") {
//         // Transaction timeout (rare with nested create, but just in case)
//         return {
//           status: 503,
//           message: "Database overloaded. Please try again later.",
//         };
//       }
//       if (error.code === "P2002") {
//         // Unique constraint violation (e.g., duplicate mobile)
//         return {
//           status: 400,
//           message: "A patient with this mobile number already exists.",
//         };
//       }
//     }

//     // --- 4. Unexpected errors ---
//     console.error("Error saving patient:", {
//       code: error.code,
//       message: error.message,
//       stack: error.stack,
//     });

//     return {
//       status: 500,
//       message: "Internal server error. Please try again later.",
//     };
//   }
// };

// export const savePatient = async (data: PatientData) => {
//   try {
//     // --- 1. Auth ---
//     const token = (await cookies()).get("user")?.value;
//     if (!token) {
//       return { status: 401, message: "Unauthorized: token missing" };
//     }

//     let coordinator: { id: string; campId: string };
//     try {
//       coordinator = jwt.verify(token, process.env.JWT_SECRET!) as {
//         id: string;
//         campId: string;
//       };
//     } catch {
//       return { status: 401, message: "Invalid token" };
//     }

//     // --- 2. Upsert patient ---
//     const result = await withRetry(async () => {
//       return prisma.patient.upsert({
//         where: { number: data.mobile }, // use unique field (mobile) to ensure idempotency
//         update: {
//           // if already exists, update coordinator (optional)
//           coordinatorId: coordinator.id,
//           name: data.name,
//           age: data.age,
//           gender: data.gender,
//         },
//         create: {
//           name: data.name,
//           age: data.age,
//           gender: data.gender,
//           number: data.mobile!,
//           coordinatorId: coordinator.id,
//           questionaire: {
//             create: {
//               alcohol: data.alcohol,
//               bmdScore: data.bmd_score,
//               copd: data.existing_medical_conditions.copd,
//               diabetes: data.existing_medical_conditions.diabetes,
//               diet: data.diet,
//               epilepsy: data.existing_medical_conditions.epilepsy,
//               height: data.height,
//               historyOfFractures: data.history_of_fractures,
//               hypertension: data.existing_medical_conditions.hypertension,
//               kneeOsteoarthritis:
//                 data.existing_medical_conditions.knee_osteoarthritis,
//               orthopaedicSurgeriesHistory: data.orthopaedic_surgeries,
//               smoking: data.smoking,
//               tobacco: data.tobacco_chewing,
//               weight: data.weight,
//               copdMedication:
//                 data.existing_medical_conditions.copd_regular_medicine,
//               epilepsyMedication:
//                 data.existing_medical_conditions.epilepsy_regular_medicine,
//               fractureAge: data.fracture_diagnosed,
//               Menopause: data.menopause,
//             },
//           },
//         },
//         include: { questionaire: true },
//       });
//     });

//     return {
//       status: 200,
//       message: "Patient and questionnaire saved successfully",
//       data: result,
//     };
//   } catch (error: any) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2028") {
//         return {
//           status: 503,
//           message: "Database overloaded. Please try again later.",
//         };
//       }
//     }

//     console.error("Error saving patient:", {
//       code: error.code,
//       message: error.message,
//       stack: error.stack,
//     });

//     return {
//       status: 500,
//       message: "Internal server error. Please try again later.",
//     };
//   }
// };

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
