import { NextResponse } from "next/server";
import Course from "@/models/Course";
import { connectMongoDB } from "@/lib/db";

export async function GET() {
  try {
    await connectMongoDB();
    const courses = await Course.getActiveCourses();
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}