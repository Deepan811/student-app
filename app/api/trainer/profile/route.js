import { NextResponse } from "next/server";
import { getTrainerProfile, updateTrainerProfile } from "@/controllers/trainerController";
import { verifyToken, isTrainer } from "@/middleware/auth";

export async function GET(request) {
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const trainerVerificationResult = await isTrainer(user);
    if (trainerVerificationResult.status !== 200) {
      return NextResponse.json(trainerVerificationResult.data, { status: trainerVerificationResult.status });
    }

    const req = { user };
    const result = await getTrainerProfile(req);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in GET /api/trainer/profile:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch trainer profile", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const trainerVerificationResult = await isTrainer(user);
    if (trainerVerificationResult.status !== 200) {
      return NextResponse.json(trainerVerificationResult.data, { status: trainerVerificationResult.status });
    }

    const body = await request.json();
    const req = { user, body };
    const result = await updateTrainerProfile(req);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Error in POST /api/trainer/profile:", error);
    return NextResponse.json({ success: false, message: "Failed to update trainer profile", error: error.message }, { status: 500 });
  }
}
