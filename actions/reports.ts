"use server";
import { prisma } from "@/prisma/client";

export const getAllDataForExcel = async () => {
  const coordinators = await prisma.coordinator.findMany({
    include: {
      doctor: true,
      patients: {
        include: {
          questionaire: true,
        },
      },
    },
  });

  const rows = coordinators.flatMap((c) =>
    c.patients.map((p) => ({
      doctor: c.doctor,
      coordinator: { campId: c.campId },
      patients: p,
      questionnaire: p.questionaire,
    }))
  );

  return rows;
};
