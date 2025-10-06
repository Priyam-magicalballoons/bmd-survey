// "use server";

// import fs from "fs/promises";
// import path from "path";
// import { read, utils } from "xlsx";
// import { prisma } from "@/prisma/client";

// export const createCoordinator = async () => {
//   const filePath = path.join(process.cwd(), "public", "final.xlsx");
//   const fileBuffer = await fs.readFile(filePath);
//   const workbook = read(fileBuffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];

//   const rows = utils.sheet_to_json(sheet, {
//     defval: "",
//   }) as any;
//   for (const row of rows) {

//     console.log("Processing:", row["Campaign Address"]);

//     await prisma.coordinator.create({
//       data: {
//         name: row.["MR Name"],
//         address : ,
//         campId : ,
//         empId : ,
//       },
//     });

//   }
// };

// createCoordinator();
