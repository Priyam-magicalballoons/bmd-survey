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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function DoctorOTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [mobile, setMobile] = useState<string>();
  const [type, setType] = useState("");
  const router = useRouter();
  const [name, setName] = useState("");
  const [regNo, setRegNo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const findMobile = async () => {
      const doctorData = await getTempData();
      if (doctorData?.type === "doctor") {
        setName(doctorData.name);
        setRegNo(doctorData.reg);
        setType("doctor");
      } else {
        setName(doctorData.name);
        setType("patient");
      }
      if (!doctorData)
        return router.push("/Osteocare-Bone-Health-Survey/start-survey");
    };
    findMobile();
  }, []);

  const handleDecline = () => {
    toast("Cannot create doctor.", {
      duration: 2000,
      position: "top-center",
      style: {
        backgroundColor: "#fef2f2",
        color: "#991b1b",
        borderColor: "#fecaca",
      },
    });
    router.push("/Osteocare-Bone-Health-Survey/start-survey");
  };

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
                className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center"
              />
              <Button
                type="submit"
                className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial mt-5"
                disabled={isLoading}
              >
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </div>
            {/* <div className="w-full flex items-center justify-center">
              <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
                <DialogTrigger>
                  <Button
                    type="button"
                    className="w-56 rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial"
                    disabled={isLoading}
                  >
                    {isLoading ? "SUBMITTING..." : "SUBMIT"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80%] overflow-y-auto sm:-ml-2">
                  <DialogHeader>
                    <DialogTitle className="text-center w-full">
                      {type === "doctor" ? "DOCTOR" : "PATIENT"} CONSENT LETTER
                    </DialogTitle>
                    <DialogDescription>
                      <pre className="text-right">
                        Date : {format(new Date(), "dd-MM-yyyy")}
                      </pre>
                      {type === "doctor" ? (
                        <pre className="float-start text-left text-wrap">
                          <code>
                            {`
To,
Cipla Limited,
Peninsula Business Park
Ganpatrao Kadam Marg
Lower Parel
Mumbai - 400013

Subject: Consent for study conduction

Study: “A Nationwide Study on Epidemiology & Risk Factors of Osteopenia &/or Osteoporosis”

(Please read the consent form carefully before signing this consent letter)

I, Dr. ${name}, currently residing at ____________________, holding registration number ${regNo}, hereby give my consent to Cipla Limited, through its employees, affiliates, or authorized representatives/consultants, including the designated vendor, to collect my personal data such as my name, city, registration number, & any other necessary information (“Personal Information”) for the purpose of conducting the above-mentioned study on screening for Osteopenia/Osteoporosis & related risk factors.

I understand & grant permission to Cipla Limited to enroll my patients in this study to help assess the prevalence of Osteopenia/Osteoporosis & associated risk factors. The analysis derived from this study will be used for educational & awareness purposes among healthcare professionals & patients. All data will be anonymized & analysed & may be submitted, published, or presented in medical journals or conferences.

It is clarified that Cipla Limited will not disclose my personally identifiable information to any third party for commercial purposes, except as stated above. I understand that my Personal Information will be processed & protected by Cipla Limited. Further details regarding the use, storage, & retention of my Personal Information can be obtained by contacting Cipla at globalprivacy@cipla.com.

This study does not involve the promotion of Cipla products or any form of consideration or commercial interest. I confirm that I have not received any consideration to promote any Cipla products.

I confirm that I have read & fully understood the study documents & contents of this letter. I hereby consent to participate in this study & authorize the recording, collection, storage, processing, sharing, & use of my personal data & that of my patients in relation to the Osteocare BMD Screening Camp facilitated by the vendor on behalf of Cipla Limited for the purposes of this study.

(In the event this document is translated into any other language, the English version shall prevail.)

Yours Sincerely,

Signature & Seal
Name: ${name}
Reg. No.: ${regNo}
Speciality: 
Clinic/ Hospital Name:
`}
                          </code>
                        </pre>
                      ) : (
                        <pre className="text-wrap">
                          {`To,
Cipla House
Peninsula Business Park
Ganpatrao Kadam Marg
Lower Parel
Mumbai - 400013

Subject: Consent for study participation

Study: “A Nationwide Study on Epidemiology & Risk Factors of Osteopenia and/or Osteoporosis”

(Please read the consent form carefully before signing this consent letter)

I, the undersigned, hereby state as follows:

I give my consent to Cipla Limited, through its employees, affiliates, or authorized representatives/consultants, including the designated vendor, to collect my personal data such as my name, age, gender, and any other necessary information (“Personal Information”) for the purpose of conducting the above-mentioned study on screening for Osteopenia/Osteoporosis and related risk factors.

I grant permission to participate in this study and authorize Cipla Limited to use the information shared by me to understand the prevalence of Osteopenia/Osteoporosis in India. The analysis of this data will be used for educational and awareness purposes. All data will be anonymized, analysed and may be submitted, published, or presented in medical journals or conferences.

It is clarified that Cipla Limited will not disclose my personally identifiable information to any third party for commercial purposes, except as stated above.

It is clarified that Cipla Limited will not disclose my personally identifiable information to any third party for commercial purposes, except as stated above.

I confirm that I have read and fully understood the contents of this Privacy Notice. I hereby consent to the recording, collection, storage, processing, sharing, and use of my personal data in relation to the Osteocare BMD Screening Camp facilitated by the vendor on behalf of Cipla Limited for the purposes of this study.

(In the event this document is translated into any other language, the English version shall prevail.)

${name}
Name/patient ID & Signature
`}
                        </pre>
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row items-center !justify-around w-full">
                    <Button
                      variant={"outline"}
                      className="cursor-pointer min-w-32 max-w-32 hover:bg-white hover:text-black"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant={"outline"}
                      className="bg-emerald-500 text-white hover:bg-emerald-500/70 cursor-pointer min-w-32 max-w-32"
                      onClick={handleVerifyOTP}
                    >
                      Accept
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
