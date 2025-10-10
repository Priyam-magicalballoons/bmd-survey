"use client";

import { savePatient } from "@/actions/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getTempData } from "@/lib/helpers";
import {
  getTempPatientData,
  saveTempPatientData,
} from "@/lib/saveTempUserData";
import { ArrowRight, Circle, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Errors = {
  [key: string]: string;
};

type MedicalConditions = {
  copd: string;
  copd_regular_medicine: string;
  knee_osteoarthritis: string;
  diabetes: string;
  epilepsy: string;
  epilepsy_regular_medicine: string;
  hypertension: string;
};

export type Questions = {
  age: string;
  gender: string;
  bmd_score: string;
  menopause: string;
  weight: string;
  height: string;
  existing_medical_conditions: MedicalConditions;
  diet: string;
  smoking: string;
  tobacco_chewing: string;
  alcohol: string;
  history_of_fractures: string;
  fracture_diagnosed: string;
  orthopaedic_surgeries: string;
};

const page = () => {
  const [questions, setQuestions] = useState<Questions>({
    age: "",
    gender: "",
    bmd_score: "",
    menopause: "",
    weight: "",
    height: "",
    existing_medical_conditions: {
      copd: "",
      copd_regular_medicine: "",
      knee_osteoarthritis: "",
      diabetes: "",
      epilepsy: "",
      epilepsy_regular_medicine: "",
      hypertension: "",
    },
    diet: "",
    smoking: "",
    tobacco_chewing: "",
    alcohol: "",
    history_of_fractures: "",
    fracture_diagnosed: "",
    orthopaedic_surgeries: "",
  });

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isNegativeBMD, setIsNegativeBMD] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (currentQuestion === 5) {
      setIsLast(true);
    } else {
      setIsLast(false);
    }
  }, [currentQuestion]);

  const validateForm = (questions: any) => {
    // Flatten everything into key/value pairs
    const entries = Object.entries({
      ...questions,
      ...questions.existing_medical_conditions,
    });

    // Fields you want to skip
    const skip = [
      "copd_regular_medicine",
      "epilepsy_regular_medicine",
      "menopause",
      "fracture_diagnosed",
    ];

    // Collect errors
    const errors: Errors = {};
    entries.forEach(([key, value]) => {
      if (
        !skip.includes(key) &&
        (value === "" || value === null || value === undefined)
      ) {
        errors[key] = "This field is required";
      }
    });

    setErrors(errors);
    return errors;
  };
  const handleNext = (e: React.FormEvent) => {
    if (
      currentQuestion === 1 &&
      (!questions.age.trim() ||
        !questions.gender.trim() ||
        !questions.height.trim() ||
        !questions.weight.trim())
    ) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      return;
    } else if (
      currentQuestion === 2 &&
      ((questions.gender === "female" && !questions.menopause) ||
        !questions.bmd_score)
    ) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      return;
    } else if (
      currentQuestion === 3 &&
      (!questions.existing_medical_conditions.knee_osteoarthritis ||
        !questions.existing_medical_conditions.diabetes ||
        !questions.existing_medical_conditions.hypertension ||
        (questions.existing_medical_conditions.copd === "yes" &&
          !questions.existing_medical_conditions.copd_regular_medicine?.trim()) ||
        (questions.existing_medical_conditions.epilepsy === "yes" &&
          !questions.existing_medical_conditions.epilepsy_regular_medicine?.trim()))
    ) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      return;
    } else if (
      currentQuestion === 4 &&
      (!questions.diet ||
        !questions.smoking ||
        !questions.tobacco_chewing ||
        !questions.alcohol.trim())
    ) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      return;
    } else if (
      isLast &&
      (!questions.orthopaedic_surgeries ||
        (questions.history_of_fractures.trim() === "yes" &&
          !questions.fracture_diagnosed.trim()))
    ) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      return;
    }
    if (currentQuestion === 5) {
      handleSubmit(e);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentQuestion((curr) => (curr > 1 ? curr - 1 : curr));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const errors = validateForm(questions);
    if (Object.keys(errors).length !== 0) {
      toast("Incomplete Form", {
        description: "Kindly fill the complete form to submit",
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

    const sessionData = await getTempData();
    if (sessionData.status === 400) {
      toast(sessionData.message, {
        description: "Kindly try again.",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });
      setIsLoading(false);
      router.push("/Osteocare-Bone-Health-Survey/add-patient");
      return;
    }

    // const savePatientData = await savePatient(sessionData, questions);
    // const campData = await getCampData();
    // const savePatientData = await producePatientEvent(
    //   {
    //     ...sessionData,
    //     ...questions,
    //   },
    //   campData.id
    // );

    try {
      const savePatientData = await savePatient({
        ...sessionData,
        ...questions,
        one: sessionData.otp,
        startTime: sessionData.startTime,
        bmd_score: isNegativeBMD
          ? `-${questions.bmd_score}`
          : questions.bmd_score,
      });

      if (
        !savePatientData ||
        savePatientData?.status === 400 ||
        savePatientData.status === 500 ||
        savePatientData.status === 503 ||
        savePatientData.status === 401
      ) {
        // Save unsaved patient data in localStorage
        saveTempPatientData({ ...sessionData, ...questions });

        toast(savePatientData?.message, {
          description: "Kindly try again.",
          duration: 5000,
          position: "top-center",
          style: {
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            borderColor: "#fecaca",
          },
        });

        setIsLoading(false);
        router.push("/Osteocare-Bone-Health-Survey/start-survey");
        return;
      } else {
        toast(savePatientData?.message, {
          duration: 2000,
          position: "top-center",
          style: {
            backgroundColor: "#f0fdf4",
            color: "#166534",
            borderColor: "#bbf7d0",
          },
        });

        return router.push("/Osteocare-Bone-Health-Survey/start-survey");
      }
    } catch (error) {
      toast("Unexpected error occurred", {
        description: "Kindly try again.",
        duration: 2000,
        position: "top-center",
        style: {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#fecaca",
        },
      });

      setIsLoading(false);
      router.push("/Osteocare-Bone-Health-Survey/start-survey");
    }
  };

  return (
    <div className="flex min-h-screen max-h-screen justify-center overflow-y-scroll py-20 w-full">
      <div className="rounded-tl-2xl rounded-tr-2xl h-fit w-80 bg-white shadow-[0px_10px_2px_1px_rgba(0,_0,_0,_0.1)] pb-10">
        <div className="bg-[#143975] h-18 rounded-tl-2xl rounded-tr-2xl text-white items-center flex justify-center text-2xl font-arial">
          SURVEY
        </div>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col gap-5 pt-2 pb-10">
              {currentQuestion === 1 && (
                <>
                  <div className="w-full flex  flex-col px-10">
                    <Label
                      htmlFor="age"
                      className="py-2 text-xl pl-2 font-arial"
                    >
                      AGE
                    </Label>
                    <Input
                      id="age"
                      type="text"
                      inputMode="numeric"
                      placeholder="Patient Age"
                      value={questions.age}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");

                        if (value) {
                          let num = parseInt(value, 10);
                          if (num < 1) num = 1;
                          if (num > 120) num = 120;
                          value = String(num);
                        } else {
                          value = "";
                        }

                        setQuestions((prev) => ({ ...prev, age: value }));
                      }}
                      required
                      className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
                    />
                  </div>
                  <div className="w-full flex flex-col px-10 ">
                    <Label
                      htmlFor="gender"
                      className="py-2 text-xl pl-2 font-arial"
                    >
                      GENDER :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.gender}
                      className="flex flex-row items-center flex-wrap -ml-5 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          menopause: "",
                          gender: e,
                        }))
                      }
                    >
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="male"
                          id="male"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="male"
                          className={`text-md border-2 border-[#143975] py-1 rounded-tr-xl rounded-bl-xl w-20 text-center font-arial flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.gender === "male"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          MALE
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="female"
                          id="female"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="female"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] font-arial hover:text-white ${
                            questions.gender === "female"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          FEMALE
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="other"
                          id="other"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="other"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center font-arial flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.gender === "other"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          OTHER
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className=" w-full flex  flex-col px-10">
                    <Label
                      htmlFor="height"
                      className="py-2 text-xl pl-2 font-arial"
                    >
                      HEIGHT (in CM)
                    </Label>
                    <Input
                      id="height"
                      type="text"
                      inputMode="decimal"
                      placeholder="Patient Height"
                      value={questions.height}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2) {
                          value = parts[0] + "." + parts.slice(1).join("");
                        }
                        value = value.slice(0, 10);

                        setQuestions((prev) => ({ ...prev, height: value }));
                      }}
                      required
                      className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
                    />
                  </div>
                  <div className=" w-full flex  flex-col px-10">
                    <Label
                      htmlFor="weight"
                      className="py-2 text-xl pl-2 font-arial"
                    >
                      WEIGHT (in KG)
                    </Label>
                    <Input
                      id="weight"
                      type="text"
                      inputMode="decimal"
                      placeholder="Patient Weight"
                      value={questions.weight}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2) {
                          value = parts[0] + "." + parts.slice(1).join("");
                        }
                        value = value.slice(0, 10);
                        setQuestions((prev) => ({ ...prev, weight: value }));
                      }}
                      required
                      className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
                    />
                  </div>
                </>
              )}
              {currentQuestion === 2 && (
                <>
                  {questions.gender === "female" && (
                    <div className="w-full flex flex-col px-10 ">
                      <Label
                        htmlFor="menopause"
                        className="py-2 text-xl pl-2 font-arial"
                      >
                        HAVE YOU ATTAINED MENOPAUSE :
                      </Label>
                      <RadioGroup
                        defaultValue={questions.menopause}
                        className="flex flex-row items-center flex-wrap -ml-5 px-2"
                        onValueChange={(e) =>
                          setQuestions((prev) => ({
                            ...prev,
                            menopause: e,
                          }))
                        }
                      >
                        <div className="flex items-center">
                          <RadioGroupItem
                            value="yes"
                            id="yes"
                            className="border-none [&>span]:hidden"
                            color="white"
                          />
                          <Label
                            htmlFor="yes"
                            className={`text-md border-2 border-[#143975] py-1 rounded-tr-xl rounded-bl-xl w-20 text-center font-arial flex justify-center hover:bg-[#143875] hover:text-white ${
                              questions.menopause === "yes"
                                ? "text-white bg-[#143875]"
                                : "border-[#143975] bg-white"
                            }`}
                          >
                            YES
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem
                            value="no"
                            id="no"
                            className="border-none [&>span]:hidden"
                          />
                          <Label
                            htmlFor="no"
                            className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center font-arial flex justify-center hover:bg-[#143875] hover:text-white ${
                              questions.menopause === "no"
                                ? "text-white bg-[#143875]"
                                : "border-[#143975] bg-white"
                            }`}
                          >
                            NO
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  <div className=" w-full flex flex-col px-5 text-center">
                    <Label
                      htmlFor="bmd-score"
                      className="py-2 text-xl pl-2 font-arial flex  justify-center"
                    >
                      BMD T-SCORE
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Select
                        onValueChange={(e) =>
                          setIsNegativeBMD(e === "-" ? true : false)
                        }
                      >
                        <SelectTrigger className="">
                          <SelectValue placeholder="select" />
                        </SelectTrigger>
                        <SelectContent className="max-w-20 min-w-20 hover: bg-transparent">
                          <SelectItem
                            value="select"
                            // onClick={() => setIsNegativeBMD(true)}
                            className=" bg-gray-100 
                                hover:bg-gray-300 
                                data-[highlighted]:bg-gray-200 
                                data-[state=checked]:bg-gray-400
                                data-[highlighted]:text-black 
                                data-[state=checked]:text-black
                                text-black
                                flex items-center justify-center px-2"
                          >
                            select
                          </SelectItem>
                          <SelectItem
                            value="-"
                            // onClick={() => setIsNegativeBMD(false)}
                            className=" bg-gray-100 
                                hover:bg-gray-300 
                                data-[highlighted]:bg-gray-200 
                                data-[state=checked]:bg-gray-400
                                data-[highlighted]:text-black 
                                data-[state=checked]:text-black
                                text-black
                                flex items-center justify-center px-2"
                          >
                            -
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="bmd-score"
                        type="text"
                        inputMode="decimal"
                        placeholder="Patient BMD T-score"
                        value={questions.bmd_score}
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/[^0-9.]/g, "");
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts.slice(1).join("");
                          }
                          value = value.slice(0, 10);
                          setQuestions((prev) => ({
                            ...prev,
                            bmd_score: value,
                          }));
                        }}
                        required
                        className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
                      />
                    </div>
                  </div>
                  <p className="px-2 flex items-center gap-1 text-gray-500 text-sm">
                    <InfoIcon size={15} className="" />
                    {`For negative values select (-) from dropdown`}
                  </p>
                </>
              )}
              {currentQuestion === 3 && (
                <>
                  <p className="uppercase font-semibold text-lg text-md tracking-tighter font-arial px-2 w-full">
                    Q. Existing medical conditions
                  </p>
                  <div className="w-full flex flex-col px-10 -ml-7">
                    <Label
                      htmlFor="gender"
                      className="py-2 text-xl pl-2 font-arial"
                    >
                      i. COPD / Asthama
                    </Label>
                    <RadioGroup
                      defaultValue={questions.existing_medical_conditions.copd}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) => {
                        setQuestions((prev) => ({
                          ...prev,
                          existing_medical_conditions: {
                            ...prev.existing_medical_conditions,
                            copd: e,
                            copd_regular_medicine: "",
                          },
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="copdyes"
                          className="border-none [&>span]:hidden "
                          color="white"
                        />
                        <Label
                          htmlFor="copdyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center font-arial checked:bg-red-500 hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.copd === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="copdno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="copdno"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center font-arial checked:bg-red-500 hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.copd === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {questions.existing_medical_conditions &&
                    questions.existing_medical_conditions.copd === "yes" && (
                      <div className="w-full flex flex-col px-10 -ml-7">
                        <RadioGroup
                          defaultValue={
                            questions.existing_medical_conditions
                              .copd_regular_medicine
                          }
                          className="flex flex-row -ml-6 px-2"
                          onValueChange={(e) =>
                            setQuestions((prev) => ({
                              ...prev,
                              existing_medical_conditions: {
                                ...prev.existing_medical_conditions,
                                copd_regular_medicine: e,
                              },
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="yes"
                              id="copdmedyes"
                              className="border-none [&>span]:hidden"
                              color="white"
                            />
                            <Label
                              htmlFor="copdmedyes"
                              className={` border-2 border-[#143975] px-2 py-3 rounded-tr-xl rounded-bl-xl w-32 justify-center font-arial hover:bg-[#143875] hover:text-white uppercase ${
                                questions.existing_medical_conditions
                                  .copd_regular_medicine === "yes"
                                  ? "text-white bg-[#143875]"
                                  : "border-[#143975] bg-white"
                              }`}
                            >
                              On regular medication
                            </Label>
                          </div>
                          <div className="flex items-center ">
                            <RadioGroupItem
                              value="no"
                              id="copdmedno"
                              className="border-none [&>span]:hidden"
                            />
                            <Label
                              htmlFor="copdmedno"
                              className={` border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-32 justify-center font-arial hover:bg-[#143875] hover:text-white uppercase ${
                                questions.existing_medical_conditions
                                  .copd_regular_medicine === "no"
                                  ? "text-white bg-[#143875]"
                                  : "border-[#143975] bg-white"
                              }`}
                            >
                              Not on regular medication
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="knee" className="py-2 text-xl pl-2 ">
                      ii. Knee Osteoarthritis :
                    </Label>
                    <RadioGroup
                      defaultValue={
                        questions.existing_medical_conditions
                          .knee_osteoarthritis
                      }
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          existing_medical_conditions: {
                            ...prev.existing_medical_conditions,
                            knee_osteoarthritis: e,
                          },
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="kneeyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="kneeyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions
                              .knee_osteoarthritis === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="kneeno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="kneeno"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions
                              .knee_osteoarthritis === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="Diabetes" className="py-2 text-xl pl-2">
                      iii. Diabetes :
                    </Label>
                    <RadioGroup
                      defaultValue={
                        questions.existing_medical_conditions
                          .knee_osteoarthritis
                      }
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          existing_medical_conditions: {
                            ...prev.existing_medical_conditions,
                            diabetes: e,
                          },
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="diabetesyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="diabetesyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.diabetes ===
                            "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="diabetesno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="diabetesno"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.diabetes ===
                            "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="Epilepsy" className="py-2 text-xl pl-2">
                      iv. Epilepsy:
                    </Label>
                    <RadioGroup
                      defaultValue={questions.existing_medical_conditions.copd}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) => {
                        setQuestions((prev) => ({
                          ...prev,
                          existing_medical_conditions: {
                            ...prev.existing_medical_conditions,
                            epilepsy: e,
                            epilepsy_regular_medicine: "",
                          },
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="Epilepsy_yes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="Epilepsy_yes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.epilepsy ===
                            "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="Epilepsy_no"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="Epilepsy_no"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions.epilepsy ===
                            "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {questions.existing_medical_conditions.epilepsy === "yes" && (
                    <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                      <RadioGroup
                        defaultValue={
                          questions.existing_medical_conditions
                            .epilepsy_regular_medicine
                        }
                        className="flex flex-row -ml-6 px-2"
                        onValueChange={(e) =>
                          setQuestions((prev) => ({
                            ...prev,
                            existing_medical_conditions: {
                              ...prev.existing_medical_conditions,
                              epilepsy_regular_medicine: e,
                            },
                          }))
                        }
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            value="yes"
                            id="epilepsymedyes"
                            className="border-none [&>span]:hidden"
                            color="white"
                          />
                          <Label
                            htmlFor="epilepsymedyes"
                            className={` border-2 border-[#143975] px-2 py-3 rounded-tr-xl rounded-bl-xl w-32 justify-center hover:bg-[#143875] hover:text-white uppercase ${
                              questions.existing_medical_conditions
                                .epilepsy_regular_medicine === "yes"
                                ? "text-white bg-[#143875]"
                                : "border-[#143975] bg-white"
                            }`}
                          >
                            On regular medication
                          </Label>
                        </div>
                        <div className="flex items-center ">
                          <RadioGroupItem
                            value="no"
                            id="epilepsymedno"
                            className="border-none [&>span]:hidden"
                          />
                          <Label
                            htmlFor="epilepsymedno"
                            className={` border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-32 justify-center hover:bg-[#143875] hover:text-white uppercase ${
                              questions.existing_medical_conditions
                                .epilepsy_regular_medicine === "no"
                                ? "text-white bg-[#143875]"
                                : "border-[#143975] bg-white"
                            }`}
                          >
                            Not on regular medication
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label
                      htmlFor="Hypertension"
                      className="py-2 text-xl pl-2 "
                    >
                      v. Hypertension/Heart disease:
                    </Label>
                    <RadioGroup
                      defaultValue={
                        questions.existing_medical_conditions.hypertension
                      }
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          existing_medical_conditions: {
                            ...prev.existing_medical_conditions,
                            hypertension: e,
                          },
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="Hypertensionyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="Hypertensionyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions
                              .hypertension === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="Hypertensionno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="Hypertensionno"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.existing_medical_conditions
                              .hypertension === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
              {currentQuestion === 4 && (
                <>
                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="Diet" className="py-2 text-xl pl-2">
                      DIET :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.diet}
                      className="flex flex-col -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          diet: e,
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="vegetarian"
                          id="vegetarian"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="vegetarian"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-40 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.diet === "vegetarian"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          VEGETARIAN
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="Vegan"
                          id="Vegan"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="Vegan"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-40 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.diet === "Vegan"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          VEGAN
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="Non-vegetarian"
                          id="Non-vegetarian"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="Non-vegetarian"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-40 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.diet === "Non-vegetarian"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NON-VEGETARIAN
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="Smoking" className="py-2 text-xl pl-2">
                      SMOKING :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.diet}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          smoking: e,
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="smokeYes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="smokeYes"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.smoking === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="smokeNo"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="smokeNo"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.smoking === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label
                      htmlFor="Tobacco chewing"
                      className="py-2 text-xl pl-2"
                    >
                      TOBACCO CHEWING :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.diet}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          tobacco_chewing: e,
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="tobaccoyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="tobaccoyes"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.tobacco_chewing === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="tobaccono"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="tobaccono"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.tobacco_chewing === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label htmlFor="Alcohol" className="py-2 text-xl pl-2">
                      ALCOHOL :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.diet}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) =>
                        setQuestions((prev) => ({
                          ...prev,
                          alcohol: e,
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="alcoholyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="alcoholyes"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.alcohol === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="alcoholno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="alcoholno"
                          className={`text-md border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.alcohol === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {currentQuestion === 5 && (
                <>
                  <div className="w-full flex flex-col px-10 -ml-7 font-arial">
                    <Label
                      htmlFor="History_of_fractures:"
                      className="py-2 text-xl pl-2"
                    >
                      HISTORY OF FRACTURES:
                    </Label>
                    <RadioGroup
                      defaultValue={questions.history_of_fractures}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) => {
                        setQuestions((prev) => ({
                          ...prev,
                          history_of_fractures: e,
                          fracture_diagnosed: "",
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="historyyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="historyyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.history_of_fractures === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="historyno"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="historyno"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.history_of_fractures === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {questions.history_of_fractures === "yes" && (
                    <div className=" w-full flex flex-col px-2">
                      <Label
                        htmlFor="fracture_diagnosed"
                        className="py-2 text-xl pl-2 font-arial"
                      >
                        Approximate Age when fracture was diagnosed?
                      </Label>
                      <Input
                        id="fracture_diagnosed"
                        type="text"
                        inputMode="numeric"
                        placeholder="AGE "
                        value={questions.fracture_diagnosed}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");

                          if (value) {
                            let num = parseInt(value, 10);
                            if (num < 1) num = 1;
                            if (num > 120) num = 120;
                            value = String(num);
                          } else {
                            value = "";
                          }

                          setQuestions((prev) => ({
                            ...prev,
                            fracture_diagnosed: value,
                          }));
                        }}
                        required
                        className="border-border bg-gray-300/50 h-10 focus-visible:ring-gray-400 focus-visible:outline-1 border-none text-center text-xl"
                      />
                    </div>
                  )}
                  <div className="w-full flex flex-col pl-10 -ml-7 font-arial">
                    <Label
                      htmlFor="History_of_ortho:"
                      className="py-2 text-xl pl-2"
                    >
                      HISTORY OF ANY ORTHOPAEDIC SURGERIES :
                    </Label>
                    <RadioGroup
                      defaultValue={questions.orthopaedic_surgeries}
                      className="flex flex-row -ml-6 px-2"
                      onValueChange={(e) => {
                        setQuestions((prev) => ({
                          ...prev,
                          orthopaedic_surgeries: e,
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="yes"
                          id="orthoyes"
                          className="border-none [&>span]:hidden"
                          color="white"
                        />
                        <Label
                          htmlFor="orthoyes"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.orthopaedic_surgeries === "yes"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          YES
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          value="no"
                          id="orthono"
                          className="border-none [&>span]:hidden"
                        />
                        <Label
                          htmlFor="orthono"
                          className={`text-lg border-2 border-[#143975] px-2 py-1 rounded-tr-xl rounded-bl-xl w-20 text-center flex justify-center hover:bg-[#143875] hover:text-white ${
                            questions.orthopaedic_surgeries === "no"
                              ? "text-white bg-[#143875]"
                              : "border-[#143975] bg-white"
                          }`}
                        >
                          NO
                        </Label>
                      </div>
                    </RadioGroup>
                    {/* {errors.orthopaedic_surgeries && (
                      <p style={{ color: "red" }}>
                        {errors.orthopaedic_surgeries}
                      </p>
                    )} */}
                  </div>
                </>
              )}
            </div>
            <div className="w-full flex items-center justify-center gap-10">
              <Button
                type="button"
                className="w-[40%] rounded-full  bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial"
                disabled={currentQuestion === 1}
                onClick={handlePrev}
              >
                {"PREVIOUS"}
              </Button>
              <Button
                type={"button"}
                className="w-[40%] rounded-full bg-white text-[#1693dc] shadow-[3px_4px_2px_1px_rgba(0,_0,_0,_0.5)] active:shadow-[0px_0px_0px_1px_rgba(_100,_100,_111,_0.1)] hover:bg-white border border-gray-200 font-arial"
                disabled={isLoading}
                onClick={(e) => handleNext(e)}
              >
                {isLast ? (isLoading ? "SUBMITTING..." : "SUBMIT") : "NEXT"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
