import { NextResponse } from "next/server";
import { getAllCourses, createCourse } from "@/controllers/courseController";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function GET(request) {
  try {
    // Middleware checks
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const adminVerificationResult = await isAdmin(tokenVerificationResult.data.user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    const result = await getAllCourses();
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch courses", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Middleware checks
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const adminVerificationResult = await isAdmin(tokenVerificationResult.data.user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    const body = await request.json();
    const req = { body };
    const result = await createCourse(req);
    return NextResponse.json(result, { status: result.status });
  } catch (error)
    {
    console.error("Error in POST /api/admin/courses:", error);
    return NextResponse.json({ success: false, message: "Failed to create course", error: error.message }, { status: 500 });
  }
}
