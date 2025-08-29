import { getAllUsers } from "../../../../controllers/adminController"
import { verifyToken, isAdmin } from "../../../../middleware/auth"
import { NextResponse } from "next/server"
import User from "../../../../models/User"
import dbConnect from "../../../../lib/dbConnect"
import { sendAccountPendingEmail } from "../../../../lib/emailService"

export async function GET(request) {
  try {
    await dbConnect();
    const tokenResult = await verifyToken(request)
    if (tokenResult.status !== 200) {
      return NextResponse.json(tokenResult.data, { status: tokenResult.status })
    }

    const adminResult = await isAdmin(tokenResult.data.user)
    if (adminResult.status !== 200) {
      return NextResponse.json(adminResult.data, { status: adminResult.status })
    }

    const page = Number.parseInt(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit")) || 10;

    const result = await getAllUsers({ query: { page, limit } }, {});
    return NextResponse.json(result.data, { status: result.status });
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
    await dbConnect();

    const existingUser = await User.findOne({ email });
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