import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectMongoDB } from "@/lib/db";

// This route is only for fetching existing branch users.
// Creation is handled by /api/admin/branches/create-branch-user

export async function GET(request) {
  try {
    await connectMongoDB();
    
    // Fetch all users that have the 'branch' role
    const branches = await User.find({ role: 'branch' });

    return NextResponse.json({ success: true, data: branches }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/admin/branches:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch branches", error: error.message }, { status: 500 });
  }
}