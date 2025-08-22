import { updateUserStatus } from "@/controllers/adminController.js"
import { verifyToken, isAdmin } from "@/middleware/auth.js"
import { NextResponse } from "next/server"

export async function PUT(request, { params }) {
  try {
    const tokenResult = await verifyToken(request)
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status })
    }

    const adminResult = await isAdmin(tokenResult.data.user)
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status })
    }

    const body = await request.json()
    const mockReq = {
      params: params,
      body: body,
      admin: adminResult.data.admin,
    }

    const updateStatusResult = await updateUserStatus(mockReq, {});

    return NextResponse.json(updateStatusResult.data, { status: updateStatusResult.status });

  } catch (error) {
    console.error("Update user status error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating user status",
      },
      { status: 500 },
    )
  }
}
