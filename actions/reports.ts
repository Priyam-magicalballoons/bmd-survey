"use server";
import { sql } from "@/lib/db";
import { decryptData } from "@/lib/saveTempUserData";
import { prisma } from "@/prisma/client";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const getPaginationData = async (
  currentPage: number,
  pageSize: number
) => {
  type PatientRow = {
    id: string;
    name: string | null;
    age: string;
    gender: string;
    number: string;
    otp: string;
    ipAddress: string;
    patientId: string;
    endedAt: Date;
    coordinatorId: string;
    patient_index: number;
    coordinator_name: string;
    camp_id: string;
    doctor_name: string | null;
    questionaire: Record<string, any>;
  };

  const patients = await prisma.$queryRaw<PatientRow[]>`
    SELECT
      p.id,
      p.name,
      p.age,
      p.gender,
      p.number,
      p.otp,
      p."ipAddress",
      p."patientId",
      p."endedAt" AS "patient_endedAt",
      p."coordinatorId",
      p."createdAt" AS "patient_createdAt",

      ROW_NUMBER() OVER (
        PARTITION BY p."coordinatorId"
        ORDER BY p."createdAt" DESC
      ) AS patient_index,

      c.name AS coordinator_name,
      c."campId" AS camp_id,
      c.address AS camp_location,
      d.name AS doctor_name,
      d."mslCode" As doctor_msl_code,
      d.number AS doctor_mobile_number,
      d."registrationNumber" AS doctor_reg_no,
      d.otp As doctor_otp,
      d."ipAddress" AS doctor_ip_address,
      d."createdAt" As doctor_createdat,
      c."endedAt" As doctor_endedat,

      jsonb_build_object(
        'bmdScore', q."bmdScore",
        'Menopause', q."Menopause",
        'weight', q."weight",
        'height', q."height",
        'copd', q."copd",
        'copdMedication', q."copdMedication",
        'kneeOsteoarthritis', q."kneeOsteoarthritis",
        'diabetes', q."diabetes",
        'epilepsy', q."epilepsy",
        'epilepsyMedication', q."epilepsyMedication",
        'hypertension', q."hypertension",
        'diet', q."diet",
        'smoking', q."smoking",
        'tobacco', q."tobacco",
        'alcohol', q."alcohol",
        'historyOfFractures', q."historyOfFractures",
        'fractureAge', q."fractureAge",
        'orthopaedicSurgeriesHistory', q."orthopaedicSurgeriesHistory",
        'createdAt', q."createdAt"
      ) AS questionaire

    FROM "Patient" p
    JOIN "Coordinator" c
      ON c.id = p."coordinatorId"
    LEFT JOIN "Doctor" d
      ON d."coordinatorId" = c.id
    LEFT JOIN "Questionaire" q
      ON q."patientId" = p.id

    ORDER BY p."coordinatorId", p."createdAt" DESC
    LIMIT ${pageSize}
    OFFSET ${(currentPage - 1) * pageSize}
  `;

  const totalCount = await prisma.patient.count();

  // const rows = await sql`
  //   SELECT
  //     row_to_json(d.*) AS doctor,

  //     jsonb_build_object(
  //       'campId', c."campId",
  //       'name', c.name,
  //       'endedAt', c."endedAt",
  //       'location', c.address
  //     ) AS coordinator,

  //     row_to_json(p.*) AS patients,
  //     row_to_json(q.*) AS questionnaire

  //   FROM "Coordinator" c

  //   LEFT JOIN "Doctor" d
  //     ON d."coordinatorId" = c.id

  //   LEFT JOIN "Patient" p
  //     ON p."coordinatorId" = c.id

  //   LEFT JOIN "Questionaire" q
  //     ON q."patientId" = p.id

  //   ORDER BY p."createdAt" ASC
  // `;

  //   const rows = await sql`
  //   SELECT
  //     d.name AS doctor_name,
  //     c."campId",
  //     c.name AS coordinator_name,
  //     c."endedAt",
  //     c.address,
  //     p.id AS patient_id,
  //     p."createdAt",
  //     q.score,
  //     q.notes
  //   FROM "Coordinator" c
  //   LEFT JOIN "Doctor" d ON d."coordinatorId" = c.id
  //   LEFT JOIN "Patient" p ON p."coordinatorId" = c.id
  //   LEFT JOIN "Questionaire" q ON q."patientId" = p.id
  //   ORDER BY p."createdAt" ASC
  // `;

  // console.log(rows[0]);

  return {
    total: totalCount,
    data: patients,
    page: currentPage,
  };
};

export async function generateReportsExcel() {
  const data = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string | null;
      age: string;
      gender: string;
      number: string;
      patientId: string;
      coordinatorId: string;
      patient_index: number;
      coordinator_name: string;
      camp_id: string;
      doctor_name: string | null;
      questionaire: Record<string, any> | null;
    }>
  >`
    SELECT
      p.id,
      p.name,
      p.age,
      p.gender,
      p.number,
      p.otp,
      p."ipAddress",
      p."patientId",
      p."endedAt" AS "patient_endedAt",
      p."coordinatorId",
      p."createdAt" AS "patient_createdAt",

      CAST(
  ROW_NUMBER() OVER (
    PARTITION BY p."coordinatorId"
    ORDER BY p."createdAt" DESC
  ) AS INT
) AS patient_index,

      c.name AS coordinator_name,
      c."campId" AS camp_id,
      c.address AS camp_location,
      d.name AS doctor_name,
      d."mslCode" As doctor_msl_code,
      d.number AS doctor_mobile_number,
      d."registrationNumber" AS doctor_reg_no,
      d.otp As doctor_otp,
      d."ipAddress" AS doctor_ip_address,
      d."createdAt" As doctor_createdat,
      c."endedAt" As doctor_endedat,

      jsonb_build_object(
        'bmdScore', q."bmdScore",
        'Menopause', q."Menopause",
        'weight', q."weight",
        'height', q."height",
        'copd', q."copd",
        'copdMedication', q."copdMedication",
        'kneeOsteoarthritis', q."kneeOsteoarthritis",
        'diabetes', q."diabetes",
        'epilepsy', q."epilepsy",
        'epilepsyMedication', q."epilepsyMedication",
        'hypertension', q."hypertension",
        'diet', q."diet",
        'smoking', q."smoking",
        'tobacco', q."tobacco",
        'alcohol', q."alcohol",
        'historyOfFractures', q."historyOfFractures",
        'fractureAge', q."fractureAge",
        'orthopaedicSurgeriesHistory', q."orthopaedicSurgeriesHistory"
      ) AS questionaire

    FROM "Patient" p
    JOIN "Coordinator" c
      ON c.id = p."coordinatorId"
    LEFT JOIN "Doctor" d
      ON d."coordinatorId" = c.id
    LEFT JOIN "Questionaire" q
      ON q."patientId" = p.id

    ORDER BY p."coordinatorId" DESC, p."createdAt" DESC
  `;

  // const workbook = new ExcelJS.Workbook();
  // const sheet = workbook.addWorksheet("Reports");

  // sheet.columns = [
  //   { header: "Camp ID", key: "camp_id", width: 15 },
  //   { header: "Coordinator", key: "coordinator_name", width: 20 },
  //   { header: "Doctor", key: "doctor_name", width: 20 },
  //   { header: "Patient Index", key: "patient_index", width: 15 },
  //   { header: "Patient Name", key: "name", width: 20 },
  //   { header: "Age", key: "age", width: 10 },
  //   { header: "Gender", key: "gender", width: 10 },
  //   { header: "Phone", key: "number", width: 15 },
  //   { header: "Patient ID", key: "patientId", width: 15 },

  //   // Questionaire fields
  //   { header: "BMD Score", key: "bmdScore", width: 15 },
  //   { header: "Menopause", key: "Menopause", width: 15 },
  //   { header: "Weight", key: "weight", width: 10 },
  //   { header: "Height", key: "height", width: 10 },
  //   { header: "COPD", key: "copd", width: 10 },
  //   { header: "Diabetes", key: "diabetes", width: 12 },
  //   { header: "Hypertension", key: "hypertension", width: 15 },
  //   { header: "Smoking", key: "smoking", width: 12 },
  //   { header: "Alcohol", key: "alcohol", width: 12 },
  // ];

  // rows.forEach((r) => {
  //   sheet.addRow({
  //     camp_id: r.camp_id,
  //     coordinator_name: r.coordinator_name,
  //     doctor_name: r.doctor_name ?? "",
  //     patient_index: r.patient_index,
  //     name: r.name ?? "",
  //     age: r.age,
  //     gender: r.gender,
  //     number: r.number,
  //     patientId: r.patientId,

  //     ...(r.questionaire ?? {}),
  //   });
  // });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("BMD Report");

  const TOTAL_COLS = 56;

  // Title
  sheet.mergeCells(1, 1, 1, TOTAL_COLS);
  sheet.getCell("A1").value = "BMD PATIENT SURVEY ACTIVITY REPORT";
  sheet.getCell("A1").font = { bold: true, size: 14 };
  sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF00" }, // gray-300
  };

  sheet.getRow(2).values = [
    "SR No",
    "Camp ID",
    "Employee Name",
    "Camp Location",
    "Doctor Name",
    "MSL Code",
    "Doctor Mobile No",
    "Doctor Reg No",
    "Doctor OTP",
    "Doctor IP",
    "Camp Start",
    "Camp End",
    "Patient ID",
    "Patient Name",
    "Patient Mobile",
    "Patient OTP",
    "Patient IP",
    "Start Date",
    "End Date",
    "Age",
    "Gender",
    "",
    "",
    "BMD T-Score",
    "Menopause",
    "",
    "Weight",
    "Height",
    "Existing Medical Conditions",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Diet",
    "",
    "",
    "Smoking",
    "",
    "Tobacco",
    "",
    "Alcohol",
    "",
    "Fractures",
    "",
    "",
    "Orthopaedic Surgery",
    "",
  ];

  sheet.getRow(3).values = [
    ...Array(20).fill(""),
    "Male",
    "Female",
    "Other",
    "",
    "Yes",
    "No",
    "",
    "",
    "COPD/Asthma",
    "",
    "",
    "",
    "Knee OA",
    "",
    "Diabetes",
    "",
    "Epilepsy",
    "",
    "",
    "",
    "Hypertension",
    "",
    "Veg",
    "Vegan",
    "Non-veg",
    "Yes",
    "No",
    "Yes",
    "No",
    "Yes",
    "No",
    "Yes",
    "",
    "No",
    "Yes",
    "No",
  ];

  sheet.getRow(4).values = [
    ...Array(27).fill(""),
    "Yes",
    "Reg Med",
    "Not Reg",
    "No",
    "Yes",
    "No",
    "Yes",
    "No",
    "Yes",
    "Reg Med",
    "Not Reg",
    "No",
    "Yes",
    "No",
    ...Array(15).fill(""),
  ];

  const merge = (r1: any, c1: any, r2: any, c2: any) =>
    sheet.mergeCells(r1, c1, r2, c2);

  // Fixed columns
  for (let c = 1; c <= 20; c++) merge(2, c, 4, c);

  // Gender
  merge(2, 21, 2, 23);

  // Menopause
  merge(2, 25, 2, 26);

  // Existing conditions
  merge(2, 29, 2, 42);

  // Diet
  merge(2, 43, 2, 45);

  // Smoking
  merge(2, 46, 2, 47);

  // Tobacco
  merge(2, 48, 2, 49);

  // Alcohol
  merge(2, 50, 2, 51);

  // Fractures
  merge(2, 52, 2, 54);

  // Orthopaedic
  merge(2, 55, 2, 56);

  for (let r = 2; r <= 4; r++) {
    sheet.getRow(r).eachCell((cell) => {
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = { bold: true };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  }

  let rowIndex = 5;

  data.forEach((d: any, i) => {
    console.log(d.patient_createdAt);
    sheet.addRow([
      i + 1,
      d.camp_id,
      d.coordinator_name,
      d.camp_location,
      d.doctor_name,
      d.doctor_msl_code,
      d.doctor_mobile_number,
      d.doctor_reg_no,
      d.doctor_otp,
      d.doctor_ip_address,
      formatInTimeZone(
        new Date(d?.doctor_createdat),
        "UTC",
        "dd-MM-yyyy HH:mm:ss"
      ),
      d.doctor_endedat ?? "ONGOING",
      `${d.camp_id}_${String(d.patient_index).padStart(3, "0")}`,
      decryptData(d.name),
      decryptData(d.number),
      d.otp,
      d.ipAddress,
      formatInTimeZone(d.patient_createdAt, "UTC", "dd-MM-yyyy HH:mm:ss"),
      formatInTimeZone(
        new Date(d.patient_endedAt),
        "UTC",
        "dd-MM-yyyy HH:mm:ss"
      ),
      d.age,

      d.gender === "male" ? "✓" : "",
      d.gender === "female" ? "✓" : "",
      d.gender === "other" ? "✓" : "",

      d.questionaire?.bmdScore,
      d.questionaire?.Menopause === "yes" ? "✓" : "",
      d.questionaire?.Menopause === "no" ? "✓" : "",

      d.questionaire?.weight,
      d.questionaire?.height,

      d.questionaire?.copd === "yes" ? "✓" : "",
      d.questionaire?.copdMedication === "yes" ? "✓" : "",
      d.questionaire?.copdMedication === "no" ? "✓" : "",
      d.questionaire?.copd === "no" ? "✓" : "",

      d.questionaire?.kneeOsteoarthritis === "yes" ? "✓" : "",
      d.questionaire?.kneeOsteoarthritis === "no" ? "✓" : "",

      d.questionaire?.diabetes === "yes" ? "✓" : "",
      d.questionaire?.diabetes === "no" ? "✓" : "",

      d.questionaire?.epilepsy === "yes" ? "✓" : "",
      d.questionaire?.epilepsyMedication === "yes" ? "✓" : "",
      d.questionaire?.epilepsyMedication === "no" ? "✓" : "",
      d.questionaire?.epilepsy === "no" ? "✓" : "",

      d.questionaire?.hypertension === "yes" ? "✓" : "",
      d.questionaire?.hypertension === "no" ? "✓" : "",

      d.questionaire?.diet === "vegetarian" ? "✓" : "",
      d.questionaire?.diet === "Vegan" ? "✓" : "",
      d.questionaire?.diet === "Non-vegetarian" ? "✓" : "",

      d.questionaire?.smoking === "yes" ? "✓" : "",
      d.questionaire?.smoking === "no" ? "✓" : "",

      d.questionaire?.tobacco === "yes" ? "✓" : "",
      d.questionaire?.tobacco === "no" ? "✓" : "",

      d.questionaire?.alcohol === "yes" ? "✓" : "",
      d.questionaire?.alcohol === "no" ? "✓" : "",

      d.questionaire?.historyOfFractures === "yes" ? "✓" : "",
      d.questionaire?.fractureAge,
      d.questionaire?.historyOfFractures === "no" ? "✓" : "",

      d.questionaire?.orthopaedicSurgeriesHistory === "yes" ? "✓" : "",
      d.questionaire?.orthopaedicSurgeriesHistory === "no" ? "✓" : "",
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
