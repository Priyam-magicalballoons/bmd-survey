"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
