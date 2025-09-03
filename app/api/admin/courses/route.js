import { NextResponse } from "next/server";
import Course from "@/models/Course";
import { connectMongoDB } from "@/lib/db";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function POST(request) {
  try {
    const tokenVerificationResult = await verifyToken(request); // Pass request directly
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user; // Get user from result

    const adminVerificationResult = await isAdmin(user); // Pass user directly
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    const body = await request.json();
    await connectMongoDB();

    const newCourse = new Course(body);
    const result = await newCourse.save();

    return NextResponse.json({ success: true, message: "Course added successfully", courseId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/admin/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to add course", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectMongoDB();
    const courses = await Course.find({});
    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}