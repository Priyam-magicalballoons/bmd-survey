"use server";

import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { prisma } from "@/prisma/client";
import { encryptData } from "./saveTempUserData";
import { generateOTP } from "./otp";

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
  otp,
  start,
}: {
  name?: string;
  mslCode?: string;
  mobile: string;
  regNo?: string;
  otp?: string;
  start?: Date;
}) => {
  if (!mobile) return;
  const saved = (await cookies()).set(
    "tempData",
    JSON.stringify({ name, mslCode, regNo, mobile, one: otp, start }),
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
      otp: parseData.one || null,
      name: parseData.name,
      reg: parseData.regNo,
    };
  } else {
    return {
      mobile: parseData.mobile,
      name: parseData.name,
      type: "patient",
      otp: parseData.one || null,
      startTime: parseData.start,
    };
  }
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: any = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        console.log(`✅ Succeeded on retry attempt ${attempt}`);
      }
      return result;
    } catch (err: any) {
      lastError = err;
      const retryableCodes = ["P2028", "P2034"];
      if (attempt < retries && err.code && retryableCodes.includes(err.code)) {
        const backoff = delayMs * Math.pow(2, attempt - 1); // exponential
        console.warn(
          `⚠️ Retry ${attempt} failed (${err.code}). Retrying in ${backoff}ms...`
        );
        await new Promise((res) => setTimeout(res, backoff));
      } else {
        break;
      }
    }
  }

  console.error(
    `🔴 All ${retries} attempts failed. Last error:`,
    lastError?.code || lastError
  );
  throw new Error("Unexpected retry error after all attempts");
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
      endedAt: new Date(Date.now()),
    },
    select: {
      doctor: {
        select: {
          number: true,
        },
      },
    },
  });

  if (!response) {
    return {
      status: 400,
      message: "Error is Closing Camp",
    };
  }

  const sentThankyouMessage = await generateOTP(
    response.doctor?.number!,
    "Thankyou"
  );

  if (response) {
    return {
      status: 200,
      message: "Camp closed successfully",
    };
  }
};

export const getIpAddress = async () => {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  return ip;
};
