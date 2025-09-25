"use server";
import { getCampData } from "@/lib/helpers";
import { prisma } from "@/prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const findDoctor = async () => {
  const token = (await cookies()).get("user")?.value;
  if (!token) return;
  const user = jwt.decode(token) as { id: string; campId: string };

  const doctor = await prisma.doctor.findFirst({
    where: {
      coordinatorId: user.id,
    },
    select: {
      id: true,
      mslCode: true,
      name: true,
      registrationNumber: true,
    },
  });

  if (!doctor) return;
  (await cookies()).set(
    "doctorId",
    jwt.sign(doctor, process.env.JWT_SECRET as string)
  );
  if (doctor) return doctor;
};

export const saveDoctor = async () => {
  const doctorData = (await cookies()).get("tempData")?.value;

  if (!doctorData) {
    return {
      status: 400,
      message: "unable to save doctor. kindly try again",
    };
  }
  const parseData = JSON.parse(doctorData);
  const coordinatorId = (await getCampData()).id;

  const createDoctor = await prisma.doctor.create({
    data: {
      mslCode: parseData.mslCode,
      name: parseData.name,
      number: parseData.mobile,
      registrationNumber: parseData.regNo,
      coordinatorId,
    },
  });

  (await cookies()).delete("tempData");

  if (!createDoctor) {
    return {
      status: 400,
      message: "unable to save doctor. kindly try again",
    };
  }

  return {
    status: 200,
    message: "doctor created successfully",
  };
};
