import { registerStudent } from "../../../../controllers/authController"

export async function POST(request) {
  try {
    console.log("[v0] Registration API called")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    let responseData = null
    let statusCode = 200

    const req = { body }
    const res = {
      status: (code) => {
        statusCode = code
        return {
          json: (data) => {
            responseData = data
            return data
          },
        }
      },
    }

    await registerStudent(req, res)

    console.log("[v0] Controller response:", responseData, "Status:", statusCode)
    return Response.json(responseData, { status: statusCode })
  } catch (error) {
    console.error("[v0] Registration API error:", error)
    return Response.json(
      {
        success: false,
        message: "Invalid request data",
        error: error.message,
      },
      { status: 400 },
    )
  }
}
