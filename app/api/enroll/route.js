import { NextResponse } from "next/server";
import { enrollCourse } from "@/controllers/enrollController";
import { verifyToken, isApprovedStudent } from "@/middleware/auth";

export async function POST(request) {
  try {
    // 1. Verify Token
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    // 2. Check if user is an approved student
    const studentVerificationResult = await isApprovedStudent(user);
    if (studentVerificationResult.status !== 200) {
      return NextResponse.json(studentVerificationResult.data, { status: studentVerificationResult.status });
    }

    // 3. Get request body
    const body = await request.json();
    
    // 4. Call controller
    const req = { user, body };
    const result = await enrollCourse(req);

    // 5. Return result
    return NextResponse.json({ success: result.success, message: result.message }, { status: result.status });
  } catch (error) {
    console.error("Error in POST /api/enroll:", error);
    return NextResponse.json({ success: false, message: "Failed to enroll in course", error: error.message }, { status: 500 });
  }
}
