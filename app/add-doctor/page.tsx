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
import { ArrowLeft, UserPlus, Phone, User, Hash } from "lucide-react";
import { toast } from "sonner";
import { saveDoctor } from "@/actions/doctor";
import { useRouter } from "next/navigation";
import { saveTempData } from "@/lib/helpers";
import { generateOTP } from "@/lib/otp";

export default function AddDoctorPage() {
  const [doctorData, setDoctorData] = useState({
    name: "",
    mslCode: "",
    mobile: "",
    regNo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorData.name || !doctorData.mslCode || !doctorData.mobile) {
      return toast("Incomplete Details", {
        description: "Please enter all the details",
        position: "top-center",
        style: {
          backgroundColor: "#feff98",
          color: "#121212",
          borderColor: "#fec106",
        },
      });
    }
    setIsLoading(true);

    if (!/^\d{10}$/.test(doctorData.mobile)) {
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

    // const response = await saveDoctor(
    //   doctorData.name,
    //   doctorData.mslCode,
    //   doctorData.regNo,
    //   doctorData.mobile
    // );
    // if (response?.status === 400) {
    //   setIsLoading(false);
    //   return toast("Error in saving doctor data", {
    //     description: "Please try again after some time",
    //     position: "top-center",
    //     style: {
    //       backgroundColor: "#feff98",
    //       color: "#121212",
    //       borderColor: "#fec106",
    //     },
    //   });
    // } else {
    const otp = await generateOTP(doctorData.mobile);
    if (!otp) return;
    const saved = await saveTempData(doctorData);
    if (saved?.status === 200) {
      router.push("/doctor-otp-verification");
    }

    setIsLoading(false);
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
        <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl">
          ADD DOCTOR
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 w-full flex items-center flex-col px-10 py-10 gap-5">
              <Input
                id="name"
                type="text"
                placeholder="Doctor Name"
                value={doctorData.name}
                onChange={(e) =>
                  setDoctorData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
              />
              <Input
                id="mslcode"
                type="text"
                placeholder="MSL Code"
                value={doctorData.mslCode}
                onChange={(e) =>
                  setDoctorData((prev) => ({
                    ...prev,
                    mslCode: e.target.value.toUpperCase(),
                  }))
                }
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
              />
              <Input
                id="regNo"
                type="text"
                placeholder="Registration No."
                value={doctorData.regNo}
                onChange={(e) =>
                  setDoctorData((prev) => ({
                    ...prev,
                    regNo: e.target.value.toUpperCase(),
                  }))
                }
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
              />
              <Input
                id="mobile"
                type="tel"
                placeholder="Mobile Number"
                value={doctorData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setDoctorData((prev) => ({ ...prev, mobile: value }));
                }}
                required
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
              />
            </div>
            <div className="w-full flex items-center justify-center">
              <Button
                type="submit"
                className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200"
                disabled={isLoading}
              >
                {isLoading ? "SUBMITTING..." : "PROCEED"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Header */}
      {/* <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center py-3 sm:py-0 sm:h-16 space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Back</span>
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Add New Doctor
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Register doctor for BMD surveys
                </p>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      {/* <main className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card className="border-border/50 shadow-lg mx-1 sm:mx-0">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-center">
              Doctor Registration
            </CardTitle>
            <CardDescription className="text-center text-sm">
              Enter doctor details to register them for conducting BMD surveys
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="doctorName"
                  className="flex items-center space-x-2 text-sm"
                >
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>Doctor Name</span>
                </Label>
                <Input
                  id="doctorName"
                  type="text"
                  placeholder="Enter doctor's full name"
                  value={doctorData.name}
                  onChange={(e) =>
                    setDoctorData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="bg-input border-border h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mslCode"
                  className="flex items-center space-x-2 text-sm"
                >
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>MSL Code</span>
                </Label>
                <Input
                  id="mslCode"
                  type="text"
                  placeholder="Enter MSL code (e.g., MSL001)"
                  value={doctorData.mslCode}
                  onChange={(e) =>
                    setDoctorData((prev) => ({
                      ...prev,
                      mslCode: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                  className="bg-input border-border h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="regNo"
                  className="flex items-center space-x-2 text-sm"
                >
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>Registration Code</span>
                </Label>
                <Input
                  id="regNo"
                  type="text"
                  placeholder="Enter Registeration Number"
                  value={doctorData.regNo}
                  onChange={(e) =>
                    setDoctorData((prev) => ({
                      ...prev,
                      regNo: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                  className="bg-input border-border h-11 sm:h-10 text-base sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mobile"
                  className="flex items-center space-x-2 text-sm"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span>Mobile Number</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={doctorData.mobile}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setDoctorData((prev) => ({ ...prev, mobile: value }));
                  }}
                  required
                  className="bg-input border-border h-11 sm:h-10 text-base sm:text-sm"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  OTP will be sent to this number for verification
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
                  disabled={
                    isLoading ||
                    !doctorData.name ||
                    !doctorData.mslCode ||
                    !doctorData.mobile
                  }
                >
                  {isLoading
                    ? "Registering Doctor..."
                    : "Register Doctor & Send OTP"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      
        <Card className="mt-4 sm:mt-6 bg-muted/50 border-border/50 mx-1 sm:mx-0">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-foreground text-sm sm:text-base">
                Next Steps
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                After registration, the doctor will receive an OTP on their
                mobile number. They must verify this OTP before they can start
                conducting patient surveys.
              </p>
            </div>
          </CardContent>
        </Card>
      </main> */}
    </div>
  );
}
