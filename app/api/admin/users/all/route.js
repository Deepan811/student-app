import { NextResponse } from "next/server";
import { viewAllUsers } from "@/controllers/adminController";
import { verifyToken, isAdmin } from "@/middleware/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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

    const result = await viewAllUsers(request, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/users/all:", error);
    return NextResponse.json({ message: "Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
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
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/all:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
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