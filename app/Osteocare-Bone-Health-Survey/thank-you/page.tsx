"use client";

import Lottie from "lottie-react";
import animationData from "@/public/images/thank-you.json";
import { useEffect, useState } from "react";
import { getThankYouData } from "@/lib/helpers";

export default function LottieAnimation() {
  const [campId, setCampId] = useState("");
  const [patientsCount, setPatientsCount] = useState("00");
  useEffect(() => {
    const getCampData = async () => {
      const campData = await getThankYouData();
      if (campData.campId) {
        setCampId(campData.campId);
        setPatientsCount(campData.patientCount);
      }
    };
    getCampData();
  }, []);
  return (
    <div className="w-full h-screen items-center justify-center flex flex-col">
      <div className="">
        <Lottie
          animationData={animationData}
          loop={true}
          className="w-72 h-72" // optional
        />
      </div>
      <p className="text-2xl md:text-3xl lg:text-4xl font-arial font-bold text-[#143975] pb-2">
        Thank You
      </p>
      <p className="text-2xl md:text-3xl lg:text-4xl font-arial font-bold text-[#143975] pb-2">
        Camp Closed Successfully
      </p>
      <p className="text-2xl md:text-3xl lg:text-4xl font-arial text-[#143975] pb-2">
        Camp ID: {campId}
      </p>
      <p className="text-2xl md:text-3xl lg:text-4xl font-arial text-[#143975] pb-2">
        Total Surveys Completed: {patientsCount}
      </p>
    </div>
  );
}
