import { removeStudentFromBatch, updateStudentPaymentStatus } from "../../../../../../../controllers/batchController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../../../../lib/dbConnect";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { batchId, studentId } = params;
    const result = await removeStudentFromBatch({ query: { batchId, studentId } }, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in DELETE /api/admin/batches/[batchId]/students/[studentId]:", error);
    return NextResponse.json({ message: "Error removing student from batch", error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { batchId, studentId } = params;
    const body = await req.json();
    const result = await updateStudentPaymentStatus({ query: { batchId, studentId }, body }, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in PUT /api/admin/batches/[batchId]/students/[studentId]:", error);
    return NextResponse.json({ message: "Error updating payment status", error: error.message }, { status: 500 });
  }
}