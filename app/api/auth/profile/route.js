import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "../../../../controllers/authController";
import { verifyToken } from "../../../../middleware/auth";
import dbConnect from "../../../../lib/dbConnect";

export async function GET(request) {
  try {
    await dbConnect();
    const tokenVerificationResult = await verifyToken(request); // Pass request directly
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user; // Get user from result

    // No need for isAdmin here, as it's a user profile

    // Call the controller function
    const profileResult = await getUserProfile({ user: user }, {}); // Pass user in mock req
    // The getUserProfile controller returns { status, data }
    return NextResponse.json(profileResult.data, { status: profileResult.status });

  } catch (error) {
    console.error("Error in GET /api/auth/profile:", error);
    return NextResponse.json({ message: "Error fetching profile", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const tokenVerificationResult = await verifyToken(request);
    if (tokenVerificationResult.status !== 200) {
      return NextResponse.json(tokenVerificationResult.data, { status: tokenVerificationResult.status });
    }
    const user = tokenVerificationResult.data.user;

    const body = await request.json();

    const profileResult = await updateUserProfile({ user: user, body: body }, {});
    return NextResponse.json(profileResult.data, { status: profileResult.status });

  } catch (error) {
    console.error("Error in POST /api/auth/profile:", error);
    return NextResponse.json({ message: "Error updating profile", error: error.message }, { status: 500 });
  }
}