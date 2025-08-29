
import { getBatchStudents } from "../../../../../../controllers/batchController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../../../lib/dbConnect";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { batchId } = params;
    const result = await getBatchStudents({ query: { batchId } }, {});
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/batches/[batchId]/students:", error);
    return NextResponse.json({ message: "Error fetching batch students", error: error.message }, { status: 500 });
  }
}