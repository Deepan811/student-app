import { NextResponse } from "next/server";
import { deleteCourse, getCourseById, updateCourse } from "@/controllers/courseController";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function GET(request, { params }) {
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

    const { courseId } = params;
    const result = await getCourseById(courseId);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error(`Error in GET /api/admin/courses/[courseId]:`, error);
    return NextResponse.json({ success: false, message: "Failed to fetch course", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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

    const { courseId } = params;
    const body = await request.json();
    const req = { body, params: { id: courseId } };
    const result = await updateCourse(req);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error(`Error in PUT /api/admin/courses/[courseId]:`, error);
    return NextResponse.json({ success: false, message: "Failed to update course", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const { courseId } = params;
    const req = { params: { id: courseId } };
    const result = await deleteCourse(req);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/courses/[courseId]:`, error);
    return NextResponse.json({ success: false, message: "Failed to delete course", error: error.message }, { status: 500 });
  }
}