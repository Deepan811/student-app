import { NextResponse } from "next/server";
import User from "@/models/User";
import Course from "@/models/Course"; // Import Course model
import dbConnect from "@/lib/dbConnect";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function GET(request) {
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const adminVerificationResult = await isAdmin(user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    await dbConnect();
    
    const students = await User.find({ role: 'student' }).populate({
      path: 'enrolledCourses.course',
      model: 'Course' // Explicitly specify the model
    });

    console.log("Students data on server:", JSON.stringify(students, null, 2));

    const filteredStudents = students.filter(s => s.enrolledCourses && s.enrolledCourses.length > 0);

    return NextResponse.json({ success: true, data: filteredStudents }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/students:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch students", error: error.message }, { status: 500 });
  }
}
