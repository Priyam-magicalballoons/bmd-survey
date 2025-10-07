"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Users,
  FileText,
  LogOut,
  User,
  Plus,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutUser } from "@/actions/auth";
import { findDoctor } from "@/actions/doctor";
import { completeCamp } from "@/lib/helpers";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();

  const handleCompleteCamp = async () => {
    const resposne = await completeCamp();
    toast(resposne?.message, {
      duration: 2000,
      position: "top-center",
      style: {
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        borderColor: "#fecaca",
      },
    });

    if (resposne?.status === 200) {
      await LogoutUser();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:pb-32">
      <div className="flex flex-col gap-10 py-20 md:pt-44">
        <div className="w-full flex items-center justify-center">
          <p className="text-center w-1/2 bg-white text-[#1693dc] text-xl font-semibold px-10 py-3 rounded-2xl font-arial">
            HOME
          </p>
        </div>
        <div className="flex-col md:flex-row flex gap-10">
          <Button
            className="text-2xl md:text-4xl px-16 max-w-80 min-w-80 py-20 md:py-24 rounded-2xl bg-[#185eb2] hover:bg-[#003a99] font-arial cursor-pointer"
            onClick={() =>
              router.push("/Osteocare-Bone-Health-Survey/start-survey")
            }
          >
            START CAMP
          </Button>
          <Button
            className="text-2xl md:text-4xl max-w-80 min-w-[48%] py-20 md:py-24 rounded-2xl bg-[#143975] hover:bg-[#102060] font-arial cursor-pointer"
            // onClick={handleCompleteCamp}
          >
            COMPLETE CAMP
          </Button>
        </div>
        <div className="px-10 py-6"></div>
      </div>
    </div>
  );
}
