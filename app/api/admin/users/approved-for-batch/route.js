import { NextResponse } from "next/server";
import { getApprovedStudentsForBatch } from "../../../../../controllers/adminController";
import { verifyToken, isAdmin } from "../../../../../middleware/auth";
import dbConnect from "../../../../../lib/dbConnect";

export async function GET(request) {
  try {
    await dbConnect();
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const adminVerificationResult = await isAdmin(user);
    if (adminVerificationResult.status !== 200) {
      return NextResponse.json(adminVerificationResult.data, { status: adminVerificationResult.status });
    }

    const result = await getApprovedStudentsForBatch(request, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/users/approved-for-batch:", error);
    return NextResponse.json({ message: "Error fetching approved students for batch", error: error.message }, { status: 500 });
  }
}
