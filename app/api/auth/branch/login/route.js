import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectMongoDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    // Ensure the user is a branch user
    if (user.role !== 'branch') {
        return NextResponse.json({ success: false, message: "Access denied. Not a branch account." }, { status: 403 });
    }

    if (user.status !== 'approved') {
        return NextResponse.json({ success: false, message: `Your account is ${user.status}. Please contact admin.` }, { status: 403 });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json({ 
      success: true, 
      message: "Login successful", 
      token: token, 
      user: userPayload 
    }, { status: 200 });

  } catch (error) {
    console.error("Error in POST /api/auth/branch/login:", error);
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
  }
}
