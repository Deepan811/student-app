
import { createBatch, getAllBatches, deleteManyBatches, deleteAllBatches } from "@/controllers/batchController";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const result = await createBatch({ body });
  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(request) {
  const { status, success, data } = await getAllBatches(request);
  return NextResponse.json({ success, data }, { status });
}

export async function DELETE(req) {
  const body = await req.json();
  const { ids } = body;
  let result;
  if (ids && ids.length > 0) {
    result = await deleteManyBatches({ body: { ids } });
  } else {
    result = await deleteAllBatches();
  }
  return NextResponse.json(result.data, { status: result.status });
}
