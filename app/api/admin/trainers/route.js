import { getAllTrainers, createTrainer } from '../../../../controllers/trainerController.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const result = await getAllTrainers();
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/admin/trainers:", error);
    return NextResponse.json({ message: "Error fetching trainers", error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await createTrainer({ body });
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in POST /api/admin/trainers:", error);
    return NextResponse.json({ message: "Error creating trainer", error: error.message }, { status: 500 });
  }
}