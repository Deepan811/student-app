import { getAllUsers } from "../../../../controllers/adminController"
import { verifyToken, isAdmin } from "../../../../middleware/auth"
import { NextResponse } from "next/server"
import User from "../../../../models/User"
import { connectMongoDB } from "../../../../lib/db"
import { sendAccountPendingEmail } from "../../../../lib/emailService"

export async function GET(request) {
  try {
    const tokenResult = await verifyToken(request)
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status })
    }

    const adminResult = await isAdmin(tokenResult.data.user)
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status })
    }

    const mockReq = {
      admin: adminResult.data.admin,
      query: Object.fromEntries(new URL(request.url).searchParams),
    }

    return new Promise(async (resolve) => {
      const mockRes = {
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code })),
        }),
        json: (data) => resolve(NextResponse.json(data)),
      }
      await getAllUsers(mockReq, mockRes)
    })
  } catch (error) {
    console.error("Get all users error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching all users",
      },
      { status: 500 },
    )
  }
}

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

    const { name, email } = await request.json();
    await connectMongoDB();

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists." }, { status: 409 });
    }

    const newUser = new User({
      name,
      email,
      status: "pending",
    });

    await newUser.save();

    await sendAccountPendingEmail(email, name);

    return NextResponse.json({ success: true, message: "Student added. A confirmation email has been sent." }, { status: 201 });
  } catch (error) {
    console.error("Add student error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while adding student",
      },
      { status: 500 },
    );
  }
}