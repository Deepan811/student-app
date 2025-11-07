import { NextResponse } from "next/server";
import { forceChangePassword } from "@/controllers/authController";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await request.json();
    const req = { user: decoded, body };

    const result = await forceChangePassword(req, {});
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("[v0] Force password change API error:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
  }
}
