"use client";

import { generateReportsExcel, getPaginationData } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { decryptData } from "@/lib/saveTempUserData";
import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  LockKeyhole,
  User2,
} from "lucide-react";

const PAGE_SIZE = 50;

import { toast } from "sonner";

const page = () => {
  const [data, setData] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  let patientIdIndex = 1;
  let prevCampID = "";

  useEffect(() => {
    setIsLoading(true);
    const check = async () => {
      const { data, page, total } = await getPaginationData(
        currentPage,
        PAGE_SIZE
      );
      // console.log(data);
      setData(data);
      setCurrentPage(page);
      setTotalPages(total);
      setIsLoading(false);
    };
    check();
  }, [currentPage]);

  function rgbToHex(rgb: string): string {
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return "FFFFFF";
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    return ((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase();
  }

  const handleDownlaod = async () => {
    const buffer = await generateReportsExcel();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BMD-report - (${format(new Date(), "do MMM yyyy")}).xlsx`;
    // a.download = "Report";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const lastLoggedInTime = sessionStorage.getItem("loggedInUserTime");
    if (lastLoggedInTime) {
      const parsedTime = JSON.parse(lastLoggedInTime!);
      if (new Date(parsedTime).getTime() + 10 * 60 * 1000 > Date.now()) {
        setLoggedIn(true);
        sessionStorage.setItem("loggedInUserTime", JSON.stringify(Date.now()));
      } else {
        setLoggedIn(false);
      }
    }
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      toast.error("Kindly fill all the details.");
      return;
    }
    if (username === "admin" && password === "admin") {
      toast.success("Logged In Successfully");
      setLoggedIn(true);
      sessionStorage.setItem("loggedInUserTime", JSON.stringify(Date.now()));
    } else {
      toast.error("Invalid username or password");
    }
  };

  if (!loggedIn) {
    return (
      <div
        className=" h-screen w-full items-center justify-center flex bg-gray-100 px-5"
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      >
        <div className="w-full md:w-1/2 lg:w-1/3 rounded-xl bg-white border-b-4 border-[#1792dd]">
          <p className="text-center font-semibold text-xl h-10 bg-[#1792dd] rounded-t-xl items-center flex justify-center text-white ">
            ADMIN LOGIN
          </p>
          <div className="mt-10 w-full flex items-center flex-col">
            <div className="w-[80%] flex items-center justify-center flex-col gap-5">
              <div className="flex flex-row items-center w-full relative">
                <User2 className="absolute left-2" />
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-2 pl-10"
                />
              </div>
              <div className="flex flex-row items-center w-full relative">
                <LockKeyhole className="absolute left-2" />
                <Input
                  placeholder="Enter Password"
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-2 pl-10"
                />
              </div>
              <Button
                onClick={handleLogin}
                className="bg-[#1792dd] my-10 w-full hover:bg-[#1792dd]/50 cursor-pointer"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-scroll h-screen w-full p-10 max-w-full">
      {data && data.length > 0 && (
        <div className="pb-5 pl-10 ">
          <Button
            className="bg-black text-white hover:bg-black/50"
            // onClick={() => exportTableToExcel("downloadTable")}
            onClick={handleDownlaod}
          >
            Download Excel
          </Button>
        </div>
      )}
      <p className="ml-10 font-semibold text-xl mb-3">
        Total count : {data.length}
      </p>
      <table
        className="border text-sm rounded-full overflow-x-scroll min-w-screen"
        id="downloadTable"
      >
        <thead>
          <tr className="text-center bg-gray-500">
            <th
              colSpan={56}
              className="border px-3 border-black py-3 text- text-black bg-gray-400"
            >
              BMD PATIENT SURVEY ACTIVITY REPORT
            </th>
          </tr>
          <tr className="rounded-tl-2xl text-[12px]">
            <th
              className="px-3 border  border-black rounded-tl-2xl"
              rowSpan={4}
            >
              SR. no
            </th>
            <th className="px-3 border border-black " rowSpan={4}>
              Camp ID
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Employee Name
            </th>
            <th className="px-32 border border-black truncate" rowSpan={4}>
              Camp location
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Doctor Name
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              MSL Code
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Doctor Mobile No.
            </th>
            <th className="px-3 border border-black min-w-36" rowSpan={4}>
              Doctor Registration No.
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Doctor OTP
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Doctor IP Address
            </th>
            <th className="px-3 border border-black min-w-28" rowSpan={4}>
              Camp Start Date and Time
            </th>
            <th className="px-3 border border-black min-w-28" rowSpan={4}>
              Camp End Date and Time
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Patient ID
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Patient name
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Patient mobile No.
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Patient OTP
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Patient IP Address
            </th>
            <th className="px-3 border border-black min-w-28" rowSpan={4}>
              Start Date and Time
            </th>
            <th className="px-3 border border-black min-w-28" rowSpan={4}>
              End Date and Time
            </th>
            <th className="px-3 border border-black" rowSpan={4}>
              Age (years)
            </th>
            <th className="px-3 border border-black" colSpan={3}>
              Gender
            </th>
            <th className="px-3 border border-black min-w-24" rowSpan={4}>
              BMD T-Score
            </th>
            <th className="border border-black min-w-56" colSpan={2}>
              Have you attained Menopause? (only for women)
            </th>
            <th className="px-3 border border-black min-w-24" rowSpan={4}>
              Weight (in kgs)
            </th>
            <th className="px-3 border border-black min-w-24" rowSpan={4}>
              Height (in cms)
            </th>
            <th className="px-3 border border-black" colSpan={14}>
              Existing medical conditions
            </th>
            <th className="px-3 border border-black" colSpan={3}>
              Diet
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Smoking
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Tobacco chewing
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Alcohol
            </th>
            <th className="px-3 border border-black" colSpan={3}>
              History of Fractures
            </th>
            <th className="px-3 border border-black min-w-44" colSpan={2}>
              History of any orthopaedic surgeries
            </th>
          </tr>
          <tr className="text-[12px]">
            <th className="px-3 border border-black" rowSpan={3}>
              Male
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Female
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Others
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            <th className="px-3 border border-black" colSpan={4}>
              COPD/ Asthma
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Knee Osteoarthritis
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Diabetes
            </th>
            <th className="px-3 border border-black" colSpan={4}>
              Epilepsy
            </th>
            <th className="px-3 border border-black" colSpan={2}>
              Hypertension/ Heart Disease
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Vegetarian
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Vegan
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Non-vegetarian
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
          </tr>
          <tr className="text-[12px]">
            <th className="px-3 border border-black" rowSpan={2}>
              Yes
            </th>
            <th className="px-3 border border-black" colSpan={2}></th>
            <th className="px-3 border border-black" rowSpan={2}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              Yes
            </th>
            <th className="px-3 border border-black" colSpan={2}></th>
            <th className="px-3 border border-black" rowSpan={2}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              No
            </th>
            <th className="px-3 border border-black" rowSpan={2}>
              Yes
            </th>
            <th className="px-3 border border-black min-w-44" rowSpan={2}>
              Approximate Age when fracture was diagnosed? (in years){" "}
            </th>
          </tr>
          <tr className="text-[12px]">
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
          </tr>
          {data.map((d: any, index: number) => {
            if (d.camp_id !== prevCampID) {
              prevCampID = d.camp_id;
              patientIdIndex -= index;
            }
            return (
              <tr key={index} className="text-center text-[12px]">
                <td className="px-3 border border-black">{index + 1}</td>
                <td className="px-3 border border-black">{d?.camp_id}</td>
                <td className="px-3 border border-black">
                  {d?.coordinator_name}
                </td>
                <td className="px-3 border border-black">{d?.camp_location}</td>
                <td className="px-3 border border-black">{d?.doctor_name}</td>
                <td className="px-3 border border-black">
                  {d?.doctor_msl_code}
                </td>
                <td className="px-3 border border-black">
                  {d?.doctor_mobile_number}
                </td>
                <td className="px-3 border border-black">{d?.doctor_reg_no}</td>
                <td className="px-3 border border-black">{d?.doctor_otp}</td>
                <td className="px-3 border border-black">
                  {d?.doctor_ip_address}
                </td>
                <td className="px-3 border border-black">
                  {(d?.doctor_createdat &&
                    format(
                      new Date(d?.doctor_createdat),
                      "dd-MM-yyyy HH:mm:ss"
                    )) ||
                    ""}
                </td>
                {d?.doctor_endedat !== null ? (
                  <td className="px-3 border border-black">
                    {format(new Date(d?.doctor_endedat), "dd-MM-yyyy HH:mm:ss")}
                  </td>
                ) : (
                  <td className="px-3 border border-black">ONGOING</td>
                )}
                <td className="px-3 border border-black">
                  {`${d?.camp_id}_${d?.patient_index
                    .toString()
                    .split("/")[0]
                    .padStart(3, "0")}`}
                </td>
                <td className="px-3 border border-black">
                  {decryptData(d?.name)}
                </td>
                <td className="px-3 border border-black">
                  {decryptData(d?.number)}
                </td>
                <td className="px-3 border border-black">{d?.otp}</td>
                <td className="px-3 border border-black">{d?.ipAddress}</td>
                <td className="px-3 border border-black">
                  {d?.patient_createdAt instanceof Date
                    ? format(
                        new Date(d?.patient_createdAt),
                        "dd-MM-yyyy HH:mm:ss"
                      )
                    : d?.patient_createdAt}
                </td>
                <td className="px-3 border border-black">
                  {d?.patient_endedAt instanceof Date
                    ? format(
                        new Date(d?.patient_endedAt),
                        "dd-MM-yyyy HH:mm:ss"
                      )
                    : d?.patient_endedAt}
                </td>
                <td className="px-3 border border-black">{d?.age}</td>
                <td className="px-3 border border-black">
                  {d?.gender === "male" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.gender === "female" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.gender === "other" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.bmdScore}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.Menopause === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.Menopause === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.weight}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.height}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.copd === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.copdMedication === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.copdMedication === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.copd === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.kneeOsteoarthritis === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.kneeOsteoarthritis === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.diabetes === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.diabetes === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.epilepsy === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.epilepsyMedication === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.epilepsyMedication === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.epilepsy === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.hypertension === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.hypertension === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.diet === "vegetarian" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.diet === "Vegan" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.diet === "Non-vegetarian" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.smoking === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.smoking === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.tobacco === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.tobacco === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.alcohol === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.alcohol === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.historyOfFractures === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black text-center">
                  {d?.questionaire?.fractureAge}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.historyOfFractures === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.orthopaedicSurgeriesHistory === "yes" &&
                    "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d?.questionaire?.orthopaedicSurgeriesHistory === "no" && "✓"}
                </td>
              </tr>
            );
          })}
        </thead>
      </table>

      <div className="flex flex-row gap-30 mt-10 sticky left-0 items-center justify-center">
        <div className="">{`Page ${currentPage} of ${Math.ceil(
          totalPages / PAGE_SIZE
        )}`}</div>

        <div className="flex flex-row items-center gap-2">
          <Button
            className="bg-black hover:bg-black/90 cursor-pointer"
            onClick={() => setCurrentPage((prev) => (prev > 1 ? 1 : prev))}
            disabled={isLoading || currentPage <= 1}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            className="bg-black hover:bg-black/90 cursor-pointer"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={isLoading || currentPage <= 1}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant={"outline"}
            className="border-2 border-black text-black "
            disabled
          >
            {currentPage}
          </Button>
          <Button
            className="bg-black hover:bg-black/90 cursor-pointer"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={
              isLoading || currentPage >= Math.ceil(totalPages / PAGE_SIZE)
            }
          >
            <ChevronRightIcon />
          </Button>
          <Button
            className="bg-black hover:bg-black/90 cursor-pointer"
            onClick={() => {
              setCurrentPage((prev) =>
                prev < Math.ceil(totalPages / PAGE_SIZE)
                  ? Math.ceil(totalPages / PAGE_SIZE)
                  : prev
              );
            }}
            disabled={
              isLoading || currentPage >= Math.ceil(totalPages / PAGE_SIZE)
            }
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default page;
