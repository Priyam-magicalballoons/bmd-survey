"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/prisma/client";

export const getCampData = async () => {
  const token = (await cookies()).get("user")?.value;
  if (!token) {
    throw new Error("token not available");
  }

  const user = jwt.decode(token) as { id: string; campId: string };

  return user;
};

export const saveTempData = async ({
  name,
  mslCode,
  mobile,
  regNo,
}: {
  name?: string;
  mslCode?: string;
  mobile: string;
  regNo?: string;
}) => {
  if (!mobile) return;
  const saved = (await cookies()).set(
    "tempData",
    JSON.stringify({ name, mslCode, regNo, mobile }),
    {
      httpOnly: true,
      maxAge: 600,
      secure: true,
      path: "/",
    }
  );

  if (!saved) return;
  return {
    status: 200,
  };
};

export const getTempData = async () => {
  const tempData = (await cookies()).get("tempData") as any;
  if (!tempData?.value) {
    return {
      status: 400,
      message: "session timed out",
    };
  }
  const parseData = JSON.parse(tempData.value);
  if (parseData.mslCode) {
    return {
      mobile: parseData.mobile,
      type: "doctor",
    };
  } else {
    return {
      mobile: parseData.mobile,
      name: parseData.name,
      type: "patient",
    };
  }
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 3000
): Promise<T> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(
        `Retry ${attempt} failed. Retrying in ${delayMs}ms...`,
        err.message
      );
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error("Unexpected retry error");
};

export const completeCamp = async () => {
  const token = (await cookies()).get("user")?.value;
  if (!token) {
    throw new Error("token not available");
  }

  const user = jwt.decode(token) as { id: string; campId: string };

  if (!user) {
    return {
      status: 400,
      message: "Unauthorised user",
    };
  }
  const response = await prisma.coordinator.update({
    where: {
      id: user.id,
    },
    data: {
      isActive: false,
    },
  });

  if (response) {
    return {
      status: 200,
      message: "Camp closed successfully",
    };
  }
};
