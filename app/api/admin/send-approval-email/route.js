import { NextResponse } from "next/server";
import { sendApprovalEmail } from "@/lib/emailService";
import { verifyToken, isAdmin } from "@/middleware/auth";

export async function POST(request) {
  try {
    const tokenResult = await verifyToken(request);
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status });
    }

    const adminResult = await isAdmin(tokenResult.data.user);
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status });
    }

    const { email, name, password } = await request.json();

    await sendApprovalEmail(email, name, password);

    return NextResponse.json({ success: true, message: "Approval email sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Send approval email error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while sending approval email",
      },
      { status: 500 },
    );
  }
}
