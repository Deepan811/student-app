import { NextResponse } from "next/server";
import { getAllCourses } from "@/controllers/courseController";

export async function GET() {
  try {
    const result = await getAllCourses();
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}