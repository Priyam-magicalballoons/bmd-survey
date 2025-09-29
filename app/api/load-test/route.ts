// app/api/test-insert/route.ts
import { NextResponse } from "next/server";
import { savePatient } from "@/actions/patient"; // import your server action

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await savePatient(body);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
