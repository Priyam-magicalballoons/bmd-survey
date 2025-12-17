"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { verifyOTP } from "@/lib/otp";
import { getTempData } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import { saveDoctor } from "@/actions/doctor";

export default function DoctorOTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("");
  const router = useRouter();

  useEffect(() => {
    const findMobile = async () => {
      const doctorData = await getTempData();
      if (doctorData?.type === "doctor") {
        setType("doctor");
      } else {
        setType("patient");
      }
      if (!doctorData)
        return router.push("/Osteocare-Bone-Health-Survey/start-survey");
    };
    findMobile();
  }, []);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      toast("Invalid OTP", {
        description: "Please enter a valid 6 digit OTP",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      setIsLoading(false);
      return;
    }

    await getTempData();
    const isVerified = await verifyOTP(otp);
    if (isVerified.status === 200) {
      toast("OTP verified successfully", {
        duration: 3000,
        position: "top-center",
        style: {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        },
      });
      if (type === "doctor") {
        const createDoctor = await saveDoctor();
        if (createDoctor.status === 400) {
          toast(createDoctor.message, {
            duration: 3000,
            position: "top-center",
            style: {
              backgroundColor: "#fef2f2",
              color: "#991b1b",
              borderColor: "#fecaca",
            },
          });
          setIsLoading(false);
          return;
        } else {
          toast(createDoctor.message, {
            duration: 5000,
            position: "top-center",
            style: {
              backgroundColor: "#f0fdf4",
              color: "#166534",
              borderColor: "#bbf7d0",
            },
          });
          router.replace("/Osteocare-Bone-Health-Survey/start-survey");
        }
      } else {
        router.replace("/Osteocare-Bone-Health-Survey/questionaire");
      }
    } else {
      toast("Invalid OTP", {
        description: "Please enter a valid 6 digit OTP",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
        <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
          OTP
        </div>
        <div>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2 w-full flex items-center flex-col px-10 pt-10 pb-5">
              <Label
                htmlFor="username"
                className="text-center py-2 text-xl font-arial"
              >
                ENTER OTP
              </Label>
              <Input
                id="username"
                type="text"
                placeholder=""
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center selection:bg-[#143975]"
              />
              <Button
                type="submit"
                className="w-56 rounded-full bg-[#143975]  text-white font-semibold shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.8)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-[#143975] tracking-wide cursor-pointer font-arial mt-5 text-md"
                disabled={isLoading}
              >
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
