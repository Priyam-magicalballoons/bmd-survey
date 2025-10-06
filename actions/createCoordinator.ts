"use server";

import fs from "fs/promises";
import path from "path";
import { read, utils } from "xlsx";

export const createCoordinator = async () => {
  const filePath = path.join(process.cwd(), "public", "final.xlsx");
  const fileBuffer = await fs.readFile(filePath);
  const workbook = read(fileBuffer, { type: "buffer" });
  //   const sheet = workbook.Sheets[workbook.SheetNames[1]];
  //   const json = utils.sheet_to_json(sheet) as any[];

  console.log("data:", workbook.Sheets.Sheet1["rows"]);
};

createCoordinator();
