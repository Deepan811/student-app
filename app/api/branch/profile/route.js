import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";
import { verifyToken } from "@/middleware/auth";

export async function PUT(request) {
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const authUser = tokenVerificationResult.data.user;

    if (authUser.role !== 'branch') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    await connectMongoDB();

    const { name, address, gst_number, alt_mobile_number } = body;

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      { name, address, gst_number, alt_mobile_number },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully", data: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Error in PUT /api/branch/profile:", error);
    return NextResponse.json({ success: false, message: "Failed to update profile", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
    try {
        const tokenVerificationResult = await verifyToken(request);
        if (tokenVerificationResult.status !== 200) {
        return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
        }
        const authUser = tokenVerificationResult.data.user;

        if (authUser.role !== 'branch') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        await connectMongoDB();

        const user = await User.findById(authUser.userId);

        if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });

    } catch (error) {
        console.error("Error in GET /api/branch/profile:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch profile", error: error.message }, { status: 500 });
    }
}
