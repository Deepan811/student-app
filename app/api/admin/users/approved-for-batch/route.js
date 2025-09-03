import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(request) {
  await dbConnect();
  try {
    const users = await User.getApprovedStudentsForBatch();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}