import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";

export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({ isActive: true });
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error in GET /api/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}
