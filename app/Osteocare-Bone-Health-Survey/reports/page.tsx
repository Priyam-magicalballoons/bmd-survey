"use client";

import { getAllDataForExcel } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { decryptData } from "@/lib/saveTempUserData";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const page = () => {
  const [data, setData] = useState<any>([]);
  useEffect(() => {
    const check = async () => {
      const response = await getAllDataForExcel();
      console.log(response);
      setData(response);
    };
    check();
  }, []);

  function exportTableToExcel(
    tableId: string,
    fileName: string = "export.csv",
    numberOfColumns: number = 51
  ) {
    const table = document.getElementById(tableId) as HTMLTableElement;
    if (!table) {
      console.error("Table not found:", tableId);
      return;
    }

    // Clone the table so we don't modify the DOM
    const tableClone = table.cloneNode(true) as HTMLTableElement;

    // Remove columns beyond numberOfColumns
    // Array.from(tableClone.rows).forEach((row) => {
    //   while (row.cells.length > numberOfColumns) {
    //     row.deleteCell(numberOfColumns);
    //   }
    // });

    // Convert to worksheet and workbook
    const ws = XLSX.utils.table_to_sheet(tableClone);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export to Excel file
    XLSX.writeFile(wb, fileName);
  }

  return (
    <div className="bg-white overflow-scroll h-screen w-full p-10 max-w-full">
      {data && data.length > 0 && (
        <div className="pb-10 pl-10 ">
          <Button
            className="bg-black text-white hover:bg-black/50"
            onClick={() => exportTableToExcel("downloadTable")}
          >
            Download Excel
          </Button>
        </div>
      )}
      <table
        className="border text-sm rounded-full overflow-x-scroll min-w-screen"
        id="downloadTable"
      >
        <thead>
          <tr className="text-center bg-gray-500">
            <th
              colSpan={51}
              className="border px-3 border-black py-3 text-xl text-white"
            >
              BMD PATIENT SURVEY ACTIVITY REPORT
            </th>
          </tr>
          <tr className="rounded-tl-2xl">
            <th className="px-3 border border-black rounded-tl-2xl">SR. no</th>
            <th className="px-3 border border-black">Camp ID</th>
            <th className="px-3 border border-black">Camp location</th>
            <th className="px-3 border border-black">Doctor Name</th>
            <th className="px-3 border border-black">MSL Code</th>
            <th className="px-3 border border-black">Doctor Mobile No.</th>
            <th className="px-3 border border-black min-w-36">
              Doctor Registration No.
            </th>
            <th className="px-3 border border-black">Doctor OTP</th>
            <th className="px-3 border border-black min-w-28">Date and Time</th>
            <th className="px-3 border border-black">Patient ID</th>
            <th className="px-3 border border-black">Patient name</th>
            <th className="px-3 border border-black">Patient mobile No.</th>
            <th className="px-3 border border-black">Patient OTP</th>
            <th className="px-3 border border-black min-w-28">Date and Time</th>
            <th className="px-3 border border-black">Age (years)</th>
            <th className="px-3 border border-black" colSpan={3}>
              Gender
            </th>
            <th className="px-3 border border-black min-w-24">BMD T-Score</th>
            <th className="border border-black min-w-56" colSpan={2}>
              Have you attained Menopause? (only for women)
            </th>
            <th className="px-3 border border-black min-w-24">
              Weight (in kgs)
            </th>
            <th className="px-3 border border-black min-w-24">
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
          <tr>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>

            <th className="px-3 border border-black">Male</th>
            <th className="px-3 border border-black">Female</th>
            <th className="px-3 border border-black">Others</th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
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
            <th className="px-3 border border-black">Vegetarian</th>
            <th className="px-3 border border-black">Vegan</th>
            <th className="px-3 border border-black">Non-vegetarian</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
          </tr>
          <tr>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black" colSpan={2}></th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black" colSpan={2}></th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">No</th>
            <th className="px-3 border border-black">Yes</th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black min-w-44">
              Approximate Age when fracture was diagnosed? (in years){" "}
            </th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
          </tr>
          <tr>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
          </tr>
          {data.map((d: any, index: number) => {
            return (
              <tr key={d.patients.id} className="text-center">
                <td className="px-3 border border-black">{index + 1}</td>
                <td className="px-3 border border-black">
                  {d.coordinator.campId}
                </td>
                <td className="px-3 border border-black">Mumbai</td>
                <td className="px-3 border border-black">{d.doctor.name}</td>
                <td className="px-3 border border-black">{d.doctor.mslCode}</td>
                <td className="px-3 border border-black">{d.doctor.number}</td>
                <td className="px-3 border border-black">
                  {d.doctor.registrationNumber}
                </td>
                <td className="px-3 border border-black">{d.doctor.otp}</td>
                <td className="px-3 border border-black">
                  {format(new Date(d.doctor.createdAt), "dd-mm-yyyy")}
                </td>
                <td className="px-3 border border-black">
                  {d.patients.patientId}
                </td>
                <td className="px-3 border border-black">
                  {decryptData(d.patients.name)}
                </td>
                <td className="px-3 border border-black">
                  {decryptData(d.patients.number)}
                </td>
                <td className="px-3 border border-black">{d.patients.otp}</td>
                <td className="px-3 border border-black">
                  {/* {d.patients.createdAt.toString()} */}
                  {format(new Date(d.patients.createdAt), "dd-mm-yyyy")}
                </td>
                <td className="px-3 border border-black">{d.patients.age}</td>
                <td className="px-3 border border-black">
                  {d.patients.gender === "male" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.patients.gender === "female" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.patients.gender === "other" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.bmdScore}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.Menopause === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.Menopause === "no" && "✓"}
                </td>
                {/* <td className="px-3 border border-black">
                  {d.questionnaire.weight}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.height}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.copd === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.copdMedication === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.copdMedication === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.copd === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.kneeOsteoarthritis === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.kneeOsteoarthritis === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.diabetes === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.diabetes === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.epilepsy === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.epilepsyMedication === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.epilepsyMedication === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.epilepsy === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.hypertension === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.hypertension === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.diet === "vegetarian" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.diet === "Vegan" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.diet === "Non-vegetarian" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.smoking === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.smoking === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.tobacco === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.tobacco === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.alcohol === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.alcohol === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.historyOfFractures === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black text-center">
                  {d.questionnaire.fractureAge}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.historyOfFractures === "no" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.orthopaedicSurgeriesHistory === "yes" && "✓"}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.orthopaedicSurgeriesHistory === "no" && "✓"}
                </td> */}
              </tr>
            );
          })}
        </thead>
      </table>
    </div>
  );
};

export default page;
