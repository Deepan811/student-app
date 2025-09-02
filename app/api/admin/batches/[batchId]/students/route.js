import { getBatchStudents } from "../../../../../../controllers/batchController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../../../lib/dbConnect";

export async function GET(req) {
  try {
    await dbConnect();
    const { pathname } = new URL(req.url);
    const batchId = pathname.split('/')[4];

    if (!batchId) {
      return NextResponse.json({ success: false, message: "Batch ID not found in URL" }, { status: 400 });
    }

    const result = await getBatchStudents({ query: { batchId } }, {});
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/batches/[batchId]/students:", error);
    return NextResponse.json({ message: "Error fetching batch students", error: error.message }, { status: 500 });
  }
}