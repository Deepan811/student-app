import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";
import { verifyToken } from "@/middleware/auth";
import { sendWelcomeEmailWithPassword } from "@/lib/emailService";

export async function POST(request) {
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const branchUser = tokenVerificationResult.data.user;

    if (branchUser.role !== 'branch') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required" }, { status: 400 });
    }

    await connectMongoDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
    }

    const randomPassword = Math.random().toString(36).slice(-8);

    const newStudent = new User({
      name,
      email,
      role: 'student',
      status: 'approved',
      generatedPassword: randomPassword,
      branch: branchUser.userId, // Link student to the branch
    });

    await newStudent.save();

    try {
      await sendWelcomeEmailWithPassword(email, name, randomPassword);
    } catch (emailError) {
      console.error("Failed to send welcome email to student:", emailError);
    }

    return NextResponse.json({ success: true, message: "Student created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/branch/students:", error);
    return NextResponse.json({ success: false, message: "Failed to create student", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
    try {
        const tokenVerificationResult = await verifyToken(request);
        if (tokenVerificationResult.status !== 200) {
            return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
        }
        const branchUser = tokenVerificationResult.data.user;

        if (branchUser.role !== 'branch') {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        await connectMongoDB();

        const students = await User.find({ branch: branchUser.userId });

        return NextResponse.json({ success: true, data: students }, { status: 200 });

    } catch (error) {
        console.error("Error in GET /api/branch/students:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch students", error: error.message }, { status: 500 });
    }
}
