"use client";

import { getAllDataForExcel } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { decryptData } from "@/lib/saveTempUserData";
import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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

  // 🔥 Utility: find nearest non-transparent background
  function findBackgroundColor(el: HTMLElement): string {
    let element: HTMLElement | null = el;
    while (element) {
      const color = window.getComputedStyle(element).backgroundColor;
      if (
        color &&
        color !== "transparent" &&
        !color.includes("rgba(0, 0, 0, 0)")
      ) {
        return color;
      }
      element = element.parentElement;
    }
    return "rgb(255, 255, 255)"; // default white
  }

  async function exportTableToExcel(
    tableId: string,
    fileName = `BMD-report - (${format(new Date(), "do MMM yyyy")}).xlsx`
  ) {
    const table = document.getElementById(tableId) as HTMLTableElement | null;
    if (!table) {
      console.error("Table not found:", tableId);
      return;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Sheet1");

    const mergeMap: { [key: string]: { rowspan: number; colspan: number } } =
      {};
    const matrix: { text: string; td: HTMLTableCellElement }[][] = [];

    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const cells = Array.from(row.cells);
      let colIndex = 0;
      matrix[r] = matrix[r] || [];

      for (const td of cells) {
        while (matrix[r][colIndex]) colIndex++;
        const colspan = td.colSpan || 1;
        const rowspan = td.rowSpan || 1;

        for (let rr = 0; rr < rowspan; rr++) {
          for (let cc = 0; cc < colspan; cc++) {
            matrix[r + rr] = matrix[r + rr] || [];
            matrix[r + rr][colIndex + cc] =
              rr === 0 && cc === 0
                ? { text: td.innerText.trim(), td }
                : { text: "", td };
          }
        }

        if (rowspan > 1 || colspan > 1) {
          mergeMap[`${r},${colIndex}`] = { rowspan, colspan };
        }

        colIndex += colspan;
      }
    }

    matrix.forEach((rowData) => {
      ws.addRow(rowData.map((cell) => cell.text));
    });

    Object.keys(mergeMap).forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const { rowspan, colspan } = mergeMap[key];
      ws.mergeCells(r + 1, c + 1, r + rowspan, c + colspan);
    });

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const cellInfo = matrix[r][c];
        const td = cellInfo.td;
        const excelCell = ws.getCell(r + 1, c + 1);
        if (!td) continue;

        const style = window.getComputedStyle(td);

        // ✅ FIXED: find nearest background (td → tr → table)
        const bgColor = findBackgroundColor(td);
        if (bgColor && !bgColor.includes("rgba(0, 0, 0, 0)")) {
          const hex = rgbToHex(bgColor);
          excelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF" + hex },
          };
        }

        // Font color + style
        const textColor = rgbToHex(style.color);
        excelCell.font = {
          bold:
            style.fontWeight === "bold" || parseInt(style.fontWeight) >= 600,
          italic: style.fontStyle === "italic",
          color: { argb: "FF" + textColor },
          size: parseInt(style.fontSize) || 12,
        };

        // Alignment
        const align: any = {
          horizontal:
            style.textAlign === "center"
              ? "center"
              : style.textAlign === "right"
              ? "right"
              : "left",
          vertical:
            style.verticalAlign === "middle"
              ? "middle"
              : style.verticalAlign === "bottom"
              ? "bottom"
              : "top",
          wrapText: true,
        };
        excelCell.alignment = align;

        // Optional border
        excelCell.border = {
          top: { style: "thin", color: { argb: "FFAAAAAA" } },
          left: { style: "thin", color: { argb: "FFAAAAAA" } },
          bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
          right: { style: "thin", color: { argb: "FFAAAAAA" } },
        };
      }
    }

    ws.columns.forEach((col) => {
      let maxLength = 10;
      col?.eachCell!({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });
      col.width = maxLength;
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
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
            <th className="px-3 border border-black" rowSpan={4}>
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
              Start Date and Time
            </th>
            <th className="px-3 border border-black min-w-28" rowSpan={4}>
              End Date and Time
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
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}

            <th className="px-3 border border-black" rowSpan={3}>
              Male
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Female
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              Others
            </th>
            {/* <th className="px-3 border border-black"></th> */}
            <th className="px-3 border border-black" rowSpan={3}>
              Yes
            </th>
            <th className="px-3 border border-black" rowSpan={3}>
              No
            </th>
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
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
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
            {/* <th className="px-3 border border-black"></th>
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
            <th className="px-3 border border-black"></th> */}
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
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
            {/* <th className="px-3 border border-black"></th> */}
            <th className="px-3 border border-black min-w-44" rowSpan={2}>
              Approximate Age when fracture was diagnosed? (in years){" "}
            </th>
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
          </tr>
          <tr className="text-[12px]">
            {/* <th className="px-3 border border-black"></th>
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
            <th className="px-3 border border-black"></th> */}
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
            {/* <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th>
            <th className="px-3 border border-black"></th> */}
            <th className="px-3 border border-black">On regular medication</th>
            <th className="px-3 border border-black min-w-32">
              Not on regular medication
            </th>
            {/* <th className="px-3 border border-black"></th>
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
            <th className="px-3 border border-black"></th> */}
          </tr>
          {data.map((d: any, index: number) => {
            return (
              <tr key={d.patients.id} className="text-center text-[12px]">
                <td className="px-3 border border-black">{index + 1}</td>
                <td className="px-3 border border-black">
                  {d.coordinator.campId}
                </td>
                <td className="px-3 border border-black">
                  {d.coordinator.name}
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
                  {d.doctor.ipAddress}
                </td>
                <td className="px-3 border border-black">
                  {format(new Date(d.doctor.createdAt), "dd-MM-yyyy HH:mm:ss")}
                </td>
                {d.coordinator.endedAt !== null ? (
                  <td className="px-3 border border-black">
                    {format(
                      new Date(d.coordinator.endedAt),
                      "dd-MM-yyyy HH:mm:ss"
                    )}
                  </td>
                ) : (
                  <td className="px-3 border border-black">ONGOING</td>
                )}
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
                  {d.patients.ipAddress}
                </td>
                <td className="px-3 border border-black">
                  {format(
                    new Date(d.patients.createdAt),
                    "dd-MM-yyyy HH:mm:ss"
                  )}
                </td>
                <td className="px-3 border border-black">
                  {format(new Date(d.patients.endedAt), "dd-MM-yyyy HH:mm:ss")}
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
                <td className="px-3 border border-black">
                  {d.questionnaire.weight}
                </td>
                <td className="px-3 border border-black">
                  {d.questionnaire.height}
                </td>
                {/* <td className="px-3 border border-black">
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
