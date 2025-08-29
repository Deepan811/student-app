import { adminLogin } from "@/controllers/adminController";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await adminLogin({ body });
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("[v1] Admin login API error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
