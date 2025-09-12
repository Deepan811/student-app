import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";
import { verifyToken, isAdmin } from "@/middleware/auth";
import { sendWelcomeEmailWithPassword } from "@/lib/emailService";

export async function POST(request) {
  try {
    // 1. Authenticate and authorize admin
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const adminVerificationResult = await isAdmin(user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    // 2. Get request body
    const { name, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required" }, { status: 400 });
    }

    await connectMongoDB();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email already exists" }, { status: 409 });
    }

    // 4. Generate password and create branch user
    const randomPassword = Math.random().toString(36).slice(-8);

    const newBranchUser = new User({
      name,
      email,
      role: 'branch',
      status: 'approved', // Branches are approved by default
      generatedPassword: randomPassword, // Pre-save hook will hash this
    });

    await newBranchUser.save();

    // 5. Send welcome email with credentials
    try {
      await sendWelcomeEmailWithPassword(email, name, randomPassword);
    } catch (emailError) {
      console.error("Failed to send welcome email to branch user:", emailError);
      // Non-fatal error, the user is already created. Log it and continue.
    }

    return NextResponse.json({ success: true, message: "Branch user created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/admin/branches/create-branch-user:", error);
    return NextResponse.json({ success: false, message: "Failed to create branch user", error: error.message }, { status: 500 });
  }
}
