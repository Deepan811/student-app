

import { createAdmin } from "../../../../controllers/adminController"
import { verifyToken, isAdmin } from "../../../../middleware/auth"
import { NextResponse } from "next/server"

export async function POST(request) {
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
      admin: adminResult.data.admin,
      body: body,
    }

    return new Promise(async (resolve) => {
      const mockRes = {
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code })),
        }),
        json: (data) => resolve(NextResponse.json(data)),
      }
      await createAdmin(mockReq, mockRes)
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error while creating admin",
      },
      { status: 500 },
    )
  }
}
