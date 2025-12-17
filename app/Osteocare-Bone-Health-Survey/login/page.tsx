"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Shield, Users } from "lucide-react";
import { AuthenticateUser, saveUser } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [campId, setCampId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [id, setId] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await AuthenticateUser(campId);
    if (response.status === 400) {
      setIsLoading(false);
      return toast(response.message, {
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
    const data = JSON.parse(response.message);
    setAddress(data.address);
    setId(data.id);
  };

  const handleConfirm = async () => {
    const response = await saveUser(id, campId);
    if (response.status === 400) {
      setIsLoading(false);
      return toast(response.message, {
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
    } else {
      setIsLoading(false);
      toast(response.message, {
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        },
      });
      return router.push("/Osteocare-Bone-Health-Survey/");
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-screen flex-col gap-20`}
    >
      <div>
        <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
          <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
            LOGIN
          </div>
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 w-full flex items-center flex-col px-10 py-10">
                <Label
                  htmlFor="username"
                  className="text-center py-2 text-xl font-arial"
                >
                  ENTER CAMP ID
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder=""
                  value={campId}
                  onChange={(e) => {
                    setAddress("");
                    setCampId(e.target.value);
                  }}
                  required
                  className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none selection:text-white selection:bg-[#143975]"
                />
              </div>
              <div className="w-full flex items-center justify-center">
                <Button
                  type="submit"
                  className="w-56 rounded-full bg-[#143975]  text-white font-semibold shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.8)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-[#143975] tracking-wide cursor-pointer font-arial text-md "
                  disabled={isLoading}
                  hidden={!!address}
                >
                  {isLoading ? "SUBMITTING..." : "SUBMIT"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {address && (
        <div className="w-full flex items-center flex-col">
          <p className="text-center pb-3 font-semibold text-lg">LOCATION</p>
          <div className="bg-white w-80 border-t-2 rounded-xl text-sm text-center p-3 border-[#143975] border-b border-x">
            {address}
          </div>
          <Button
            onClick={handleConfirm}
            className="w-56 rounded-full bg-[#143975]  text-white font-semibold shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.8)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-[#143975] tracking-wide cursor-pointer font-arial mt-5 text-md"
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}
