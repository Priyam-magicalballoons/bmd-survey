"use client";

import { findDoctor } from "@/actions/doctor";
import { getPatientNumber } from "@/actions/patient";
import { Button } from "@/components/ui/button";
import { getCampData } from "@/lib/helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type CampDataType = {
  id: string;
  campId: string;
};

type DoctorDataType = {
  name: string;
  mslCode: string;
  registrationNumber: string;
  id: string;
};

const page = () => {
  const router = useRouter();

  const [doctorData, setDoctorData] = useState<DoctorDataType | undefined>();
  const [campData, setCampData] = useState<CampDataType>();
  const [patientCount, setPatientCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const getDoctor = async () => {
    const doctor = await findDoctor();
    if (!doctor) {
      setDoctorData(undefined);
      setLoaded(true);
      return;
    }
    setDoctorData(doctor);
    setLoaded(false);
  };

  const getPatientCounts = async () => {
    const counts = await getPatientNumber();
    if (counts.status === 400) return;
    setPatientCount(counts.data!);
  };

  const findCampData = async () => {
    const campData = await getCampData();
    setCampData(campData);
  };
  useEffect(() => {
    findCampData();
    getDoctor();
    getPatientCounts();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center md:pb-32 font-arial">
      <div className="flex flex-col gap-10 py-20 md:pt-44">
        <div className="w-full flex items-center justify-center">
          <p className="text-center  bg-white text-[#1693dc] text-xl font-semibold px-10 py-3 rounded-2xl">
            CAMP ID {campData && ` : ${campData.campId}`}
          </p>
        </div>

        <div className="flex-col md:flex-row flex gap-10">
          <Button
            className={`text-2xl md:text-4xl px-16 max-w-80 min-w-80 py-20 md:py-24 rounded-2xl bg-[#eff8f8] relative overflow-hidden border-2 border-[#143975] hover:bg-[#eff8f8] cursor-pointer hover:scale-105 disabled:opacity-100  disabled:bg-gray-200 ${
              doctorData && "cursor-not-allowed "
            }`}
            disabled={!!doctorData || !loaded}
            onClick={() => {
              if (!loaded) return;
              router.push("/Osteocare-Bone-Health-Survey/add-doctor");
            }}
          >
            <Image
              src="/images/doctor.png"
              className="-left-8 absolute h-44 -bottom-6"
              alt=""
              width={200}
              height={100}
            />
            {doctorData ? (
              <div className="absolute right-3 text-[#1693dc] text-[15px] md:text-xl md:max-w-44 text-left">
                <p className="truncate">
                  Name : {doctorData.name.split(" ")[0]}
                </p>
                <p className="truncate">Msl Code : {doctorData.mslCode}</p>
                <p className="truncate">
                  Reg. No : {doctorData.registrationNumber}
                </p>
                <p className="text-transparent">dummy</p>
              </div>
            ) : (
              <>
                <p className="absolute right-3 text-[#1693dc] text-xl md:text-2xl">
                  ADD DOCTOR
                </p>
              </>
            )}
            <span className="absolute h-10 w-10 rounded-full bg-[#1693dc] flex items-center justify-center bottom-2 right-2 text-xl">
              {doctorData ? "01" : "00"}
            </span>
          </Button>
          <Button
            className="text-2xl md:text-4xl px-16 max-w-80 min-w-80 py-20 md:py-24 rounded-2xl bg-[#d4fcfa] relative overflow-hidden border-2 border-[#143975] hover:bg-[#d4fcfa] hover:scale-105 cursor-pointer"
            onClick={() => {
              if (doctorData?.id === "id") return;
              router.push("/Osteocare-Bone-Health-Survey/add-patient");
            }}
            disabled={!doctorData}
          >
            <Image
              src="/images/girl.png"
              className="left-2 absolute h-44 -bottom-5 "
              alt=""
              width={200}
              height={100}
            />
            <p className="absolute right-3 text-[#1693dc] text-xl md:text-2xl">
              ADD PATIENT
            </p>
            <span className="absolute h-10 w-10 rounded-full bg-[#1693dc] flex items-center justify-center bottom-2 right-2 text-xl">
              {patientCount < 9 ? `0${patientCount}` : patientCount || "00"}
            </span>
          </Button>
        </div>

        <div
          className="w-full flex items-center justify-center"
          onClick={() => router.replace("/")}
        >
          <Button className="text-center  bg-white text-[#1693dc] text-xl font-semibold px-10 py-6 rounded-2xl border border-[#1693dc] hover:bg-white hover:scale-105">
            HOME
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
