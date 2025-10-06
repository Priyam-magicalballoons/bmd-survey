"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/client";

export const saveUser = async (id: string, campId: string) => {
  const token = await jwt.sign(
    { id: id, campId: campId },
    process.env.JWT_SECRET as string
  );

  if (token) {
    (await cookies()).set("user", token);
    return {
      status: 200,
      message: "Logged in successfully",
    };
  } else {
    return {
      status: 400,
      message: "Internal server error",
    };
  }
};

export const AuthenticateUser = async (id: string) => {
  if (!id) {
    return {
      status: 400,
      message: "Id not provided",
    };
  }

  const user = await prisma.coordinator.findUnique({
    where: {
      campId: id,
    },
  });

  if (!user) {
    return {
      status: 400,
      message: "Unauthorised user",
    };
  }

  return {
    status: 200,
    message: JSON.stringify({ address: user.address, id: user.id }),
  };
};

export const LogoutUser = async () => {
  (await cookies()).delete("user");
  redirect("/");
};
