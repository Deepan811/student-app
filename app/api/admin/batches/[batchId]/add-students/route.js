
import { addStudentsToBatch } from "../../../../../../controllers/batchController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../../../lib/dbConnect";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { batchId } = params;
    const body = await req.json();
    const result = await addStudentsToBatch({ query: { batchId }, body }, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in PUT /api/admin/batches/[batchId]/add-students:", error);
    return NextResponse.json({ message: "Error adding students to batch", error: error.message }, { status: 500 });
  }
}