import { NextResponse } from "next/server";
import { loginStudent } from "../../../../controllers/authController"

export async function POST(request) {
  try {
    const body = await request.json()

    const req = { body }

    const result = await loginStudent(req, {});
    return NextResponse.json(result.data, { status: result.status });

  } catch (error) {
    console.error("[v0] User login API error:", error)
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 })
  }
}
