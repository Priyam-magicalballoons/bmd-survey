"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { generateOTP } from "@/lib/otp";
import { saveTempData } from "@/lib/helpers";
import { useRouter } from "next/navigation";

export default function AddDoctorPage() {
  const [patientData, setPatientData] = useState({
    name: "",
    mobile: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate mobile number
    if (!/^\d{10}$/.test(patientData.mobile)) {
      toast("Invalid Mobile Number", {
        description: "Please enter a valid 10-digit mobile number",
        position: "top-center",
        style: {
          backgroundColor: "#feff98",
          color: "#121212",
          borderColor: "#fec106",
        },
      });
      setIsLoading(false);
      return;
    }

    const otp = await generateOTP(patientData.mobile, "OTP", "Patient");
    if (otp.status === 500 || otp.status === 400) {
      toast(otp.message, {
        position: "top-center",
        style: {
          backgroundColor: "#feff98",
          color: "#121212",
          borderColor: "#fec106",
        },
      });
      setIsLoading(false);
      return;
    }
    const saved = await saveTempData({ ...patientData, otp: otp.message });
    if (saved?.status === 200) {
      router.push("/Osteocare-Bone-Health-Survey/doctor-otp-verification");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
        <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
          ADD PATIENT
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 w-full flex items-center flex-col px-10 py-10 gap-5">
              <Input
                autoFocus
                id="name"
                type="text"
                placeholder="Patient Name"
                value={patientData.name}
                onChange={(e) =>
                  setPatientData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl selection:bg-[#143975]"
              />
              <Input
                id="mobile"
                type="tel"
                placeholder="Mobile Number"
                value={patientData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPatientData((prev) => ({ ...prev, mobile: value }));
                }}
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl selection:bg-[#143975]"
              />
            </div>
            <div className="w-full flex items-center justify-center">
              <Button
                type="submit"
                className="w-56 rounded-full bg-[#143975]  text-white font-semibold shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.8)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-[#143975] tracking-wide cursor-pointer font-arial mt-5 text-md"
                disabled={isLoading}
              >
                {isLoading ? "SUBMITTING..." : "PROCEED"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
