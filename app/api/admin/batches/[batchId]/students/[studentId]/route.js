import { removeStudentFromBatch, updateStudentPaymentStatus } from "../../../../../../../controllers/batchController.js";
import { NextResponse } from 'next/server';
import dbConnect from "../../../../../../../lib/dbConnect";

export async function DELETE(req) {
  try {
    await dbConnect();
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const batchId = pathSegments[4];
    const studentId = pathSegments[6];

    if (!batchId || !studentId) {
      return NextResponse.json({ success: false, message: "Batch ID or Student ID not found in URL" }, { status: 400 });
    }

    const result = await removeStudentFromBatch({ query: { batchId, studentId } }, {});
    const responseBody = {
        success: result.success,
        data: result.data,
        message: result.message || ''
    };
    return NextResponse.json(responseBody, { status: result.status });
  } catch (error) {
    console.error("Error in DELETE /api/admin/batches/[batchId]/students/[studentId]:", error);
    return NextResponse.json({ message: "Error removing student from batch", error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const batchId = pathSegments[4];
    const studentId = pathSegments[6];

    if (!batchId || !studentId) {
      return NextResponse.json({ success: false, message: "Batch ID or Student ID not found in URL" }, { status: 400 });
    }

    const body = await req.json();
    const result = await updateStudentPaymentStatus({ query: { batchId, studentId }, body }, {});
    const responseBody = {
        success: result.success,
        data: result.data,
        message: result.message || ''
    };
    return NextResponse.json(responseBody, { status: result.status });
  } catch (error) {
    console.error("Error in PUT /api/admin/batches/[batchId]/students/[studentId]:", error);
    return NextResponse.json({ message: "Error updating payment status", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split('/');
    const batchId = pathSegments[4];
    const studentId = pathSegments[6];

    if (!batchId || !studentId) {
      return NextResponse.json({ success: false, message: "Batch ID or Student ID not found in URL" }, { status: 400 });
    }

    const body = await req.json();
    const result = await updateStudentPaymentStatus({ query: { batchId, studentId }, body }, {});
    const responseBody = {
        success: result.success,
        data: result.data,
        message: result.message || ''
    };
    return NextResponse.json(responseBody, { status: result.status });
  } catch (error) {
    console.error("Error in PATCH /api/admin/batches/[batchId]/students/[studentId]:", error);
    return NextResponse.json({ message: "Error updating payment status", error: error.message }, { status: 500 });
  }
}