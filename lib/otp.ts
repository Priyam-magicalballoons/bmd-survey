"use server";

import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";

export const generateOTP = async (phone: string) => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const saveToDb = await prisma.otp.upsert({
    where: {
      phone,
    },
    update: {
      otp,
      expiresAt,
    },
    create: {
      phone,
      otp,
      expiresAt,
    },
  });

  if (!saveToDb) {
    return {
      status: 400,
      message: "error in saving otp",
    };
  }

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

  return true;
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
  const otpRecord = await prisma.otp.findUnique({
    where: { phone: parseData.mobile, otp },
  });

  if (!otpRecord) {
    return {
      status: 400,
      message: "Incorrect OTP",
    };
  }

  return {
    status: 200,
    message: "success",
  };
};
