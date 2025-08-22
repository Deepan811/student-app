import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken, isAdmin } from "@/middleware/auth"; // Import isAdmin

export async function GET(request) {
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

    await connectMongoDB();
    const users = await User.getAllUsersForAdmin();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/users/all:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function DELETE(request) {
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

    const id = request.nextUrl.searchParams.get("id");
    await connectMongoDB();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/all:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(request) {
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

    const id = request.nextUrl.searchParams.get("id");
    const { name, email, password, role, courses } = await request.json();
    await connectMongoDB();

    const updateFields = { name, email, role, courses };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    await User.findByIdAndUpdate(id, updateFields);
    return NextResponse.json({ message: "User updated" }, { status: 200 });
  } catch (error) {
    console.error("Error in PUT /api/admin/users/all:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}