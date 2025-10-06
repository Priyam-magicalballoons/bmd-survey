"use server";

import { prisma } from "@/prisma/client";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { cookies } from "next/headers";
import { decryptData, encryptData, hashData } from "./saveTempUserData";
import { getTempData } from "./helpers";
import { parse } from "path";

export const generateOTP = async (phone: string) => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  const phoneExists = await prisma.otp.findUnique({
    where: {
      phone: hashData(phone),
    },
  });

  if (phoneExists) {
    return {
      status: 500,
      message: "Number already exists",
    };
  }

  // try {
  //   const saveToDb = await prisma.otp.create({
  //     data: {
  //       phone: hashData(phone),
  //       otp,
  //     },
  //   });

  //   if (!saveToDb) {
  //     return {
  //       status: 400,
  //       message: "Error in saving phone number.",
  //     };
  //   }
  // } catch (error: any) {
  //   if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //     if (error.code === "P2002") {
  //       return {
  //         status: 500,
  //         message: "Number already exists",
  //       };
  //     }
  //   } else {
  //     console.log(error);
  //     return {
  //       status: 400,
  //       message: "Error in saving phone number.",
  //     };
  //   }
  // }
  // console.log(otp);
  // return true;

  const msg = `Your OTP for Participation in Bone Health Survey is ${otp}   
Regards,
Cipla`;

  const res = await fetch("http://sms.magicalballoons.co.in/REST/sendsms/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      listsms: [
        {
          sms: msg,
          mobiles: phone,
          senderid: "SUROTP",
          clientsmsid: "+918451938833",
          accountusagetypeid: "1",
          entityid: "1201159145178998125",
          tempid: "1207160881177758371",
        },
      ],
      password: "b9d1b575f6XX",
      user: "MagicalB",
    }),
  });

  //   const res = await fetch("http://sms.magicalballoons.co.in/REST/sendsms/", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       listsms: [
  //         {
  //           sms: `Thank You for filling random
  //           Regards,
  //           Cipla`,
  //           mobiles: "7709123609",
  //           senderid: "SUROTP",
  //           clientsmsid: "+918451938833",
  //           accountusagetypeid: "1",
  //           entityid: "1201159145178998125",
  //           tempid: "1207161971068993268",
  //         },
  //       ],
  //       password: "b9d1b575f6XX",
  //       user: "MagicalB",
  //     }),
  //   });

  console.log(otp);
  return { status: 200, message: encryptData(otp) };
};

export const verifyOTP = async (otp: string) => {
  const data = (await cookies()).get("tempData")?.value;

  if (!data) {
    return {
      status: 400,
      message: "OTP Expired or incorrect",
    };
  }
  const parseData = JSON.parse(data);

  console.log(parseData);

  const phone = hashData(parseData.mobile);
  const savedOTP = decryptData(parseData.one);

  const type = parseData.mslCode ? "doctor" : "patient";
  console.log("type🍕🍕", type);
  if (savedOTP === otp) {
    if (type === "doctor") {
      const otpRecord = await prisma.otp.create({
        data: { phone, otp },
      });
      if (!otpRecord) {
        return {
          status: 400,
          message: "Internal server error",
        };
      }
    }
    return {
      status: 200,
      message: "success",
    };
  }

  return {
    status: 400,
    message: "Incorrect OTP",
  };

  // (await cookies()).set("tempData", JSON.stringify({ ...parseData, otp }), {
  //   httpOnly: true,
  //   maxAge: 600,
  //   secure: true,
  //   path: "/",
  // });
};
