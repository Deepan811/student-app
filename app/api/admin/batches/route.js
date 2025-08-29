
import { createBatch, getAllBatches } from "../../../../controllers/batchController.js"
import { NextResponse } from 'next/server';
import dbConnect from "../../../../lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const result = await createBatch({ body }, {});
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in POST /api/admin/batches:", error);
    return NextResponse.json({ message: "Error creating batch", error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const result = await getAllBatches({}, {});
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/batches:", error);
    return NextResponse.json({ message: "Error fetching batches", error: error.message }, { status: 500 });
  }
}
