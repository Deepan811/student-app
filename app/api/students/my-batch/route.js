import { getMyBatchDetails } from "../../../../controllers/studentController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../lib/dbConnect.js";
import { verifyToken } from "../../../../middleware/auth.js";

export async function GET(req) {
  try {
    await dbConnect();

    // Verify the token
    const authResult = await verifyToken(req);
    if (authResult.status !== 200) {
      return NextResponse.json(authResult.data, { status: authResult.status });
    }
    
    // The controller expects req.user to be set
    const mockReq = {
      user: authResult.data.user
    };

    const result = await getMyBatchDetails(mockReq, {});
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/students/my-batch:", error);
    return NextResponse.json({ message: "Error fetching batch details", error: error.message }, { status: 500 });
  }
}
