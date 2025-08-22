import { getPendingUsers } from "@/controllers/adminController.js"
import { verifyToken, isAdmin } from "@/middleware/auth.js"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    // Step 1: Verify the token
    const tokenResult = await verifyToken(request)
    console.log("tokenResult:", tokenResult);
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status })
    }

    // Step 2: Check if the user is an admin
    const adminResult = await isAdmin(tokenResult.data.user)
    console.log("adminResult:", adminResult);
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status })
    }

    // Step 3: Fetch pending users
    const pendingUsersResult = await getPendingUsers({ admin: adminResult.data.admin }, {});

    return NextResponse.json(pendingUsersResult.data, { status: pendingUsersResult.status });

  } catch (error) {
    console.error("An unexpected error occurred:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
