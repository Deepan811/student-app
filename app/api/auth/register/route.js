import { registerStudent } from "../../../../controllers/authController";
import { NextResponse } from "next/server"; // Import NextResponse

export async function POST(request) {
  try {
    console.log("[v0] Registration API called");
    const body = await request.json();
    console.log("[v0] Request body:", body);

    let responseData = null;
    let statusCode = 200;

    const req = { body };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            return data;
          },
        };
      },
    };

    await registerStudent(req, res);

    console.log("[v0] Controller response:", responseData, "Status:", statusCode);

    // Create a NextResponse and set headers
    const response = NextResponse.json(responseData, { status: statusCode });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;

  } catch (error) {
    console.error("[v0] Registration API error:", error);
    const errorResponse = NextResponse.json(
      {
        success: false,
        message: "Invalid request data",
        error: error.message,
      },
      { status: 400 },
    );
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return errorResponse;
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}