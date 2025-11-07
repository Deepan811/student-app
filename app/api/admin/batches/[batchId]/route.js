import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const batchController = await import("@/controllers/batchController.js");
    const { batchId } = params;
    const result = await batchController.deleteBatchById({ query: { batchId } });

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error in DELETE /api/admin/batches/[batchId]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
