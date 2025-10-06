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
  const [isResending, setIsResending] = useState(false);
  const [mobile, setMobile] = useState<string>();
  const [type, setType] = useState("");
  const router = useRouter();
  // const [doctorInfo, setDoctorInfo] = useState({
  //   name: "",
  //   mslCode: "",
  //   mobile: "",
  //   regNo: "",
  // });

  // useEffect(() => {
  //   const sendOTP = async () => {
  //     await generateOTP();
  //   };
  //   sendOTP();
  // }, []);

  // useEffect(() => {
  //   // Get doctor info from URL params
  //   const params = new URLSearchParams(window.location.search);
  //   setDoctorInfo({
  //     name: params.get("doctorName") || "",
  //     mslCode: params.get("mslCode") || "",
  //     mobile: params.get("mobile") || "",
  //     regNo: params.get("regNo") || "",
  //   });
  // }, []);

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
        duration: 2000,
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
        } else {
          toast(createDoctor.message, {
            duration: 2000,
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
    // Simulate OTP verification
  };

  const handleResendOTP = async () => {
    setIsResending(true);

    // Simulate resending OTP
    setTimeout(() => {
      toast("OTP Resent", {
        description: "A new OTP has been sent to the doctor's mobile number",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#bbf7d0",
        },
      });
      setIsResending(false);
    }, 1000);
  };

  // const maskedMobile = doctorInfo.mobile
  //   ? `${doctorInfo.mobile.slice(0, 2)}****${doctorInfo.mobile.slice(-2)}`
  //   : "";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-tl-2xl rounded-tr-2xl w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
        <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
          OTP
        </div>
        <div>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2 w-full flex items-center flex-col px-10 py-10">
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
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center"
              />
            </div>
            <div className="w-full flex items-center justify-center">
              <Button
                type="submit"
                className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial"
                disabled={isLoading}
              >
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Header */}
      {/* <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden md:flex">Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Doctor OTP Verification
                </h1>
                <p className="text-sm text-muted-foreground">
                  Verify doctor's mobile number
                </p>
              </div>
            </div>
          </div>
        </div>
      </header> */}
      {/* <div>{mobile && mobile}</div> */}
      {/* Main Content */}
      {/* <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <div className="text-center space-y-2">
              <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Doctor</CardTitle>
              <CardDescription>
                An OTP has been sent to the doctor's mobile number for
                verification
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Doctor Name:
                </span>
                <span className="text-sm font-medium">{doctorInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">MSL Code:</span>
                <span className="text-sm font-medium">
                  {doctorInfo.mslCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mobile:</span>
                <span className="text-sm font-medium">{maskedMobile}</span>
              </div>
            </div>

            
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-6 digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  required
                  className="bg-input border-border text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground text-center">
                  Please enter the OTP sent to {maskedMobile}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                      Verifying OTP...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleResendOTP}
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        
        <Card className="mt-6 bg-muted/50 border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-foreground">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                If you haven't received the OTP, please check your mobile
                network and try resending.
              </p>
            </div>
          </CardContent>
        </Card>
      </main> */}
    </div>
  );
}
