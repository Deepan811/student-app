import { loginAdmin } from "../../../../controllers/authController"

export async function POST(request) {
  try {
    const body = await request.json()
    console.log("[v0] Admin login request body:", body)

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

    await loginAdmin(req, res)

    return Response.json(responseData, { status: statusCode })
  } catch (error) {
    console.error("[v0] Admin login API error:", error)
    return Response.json({ success: false, message: "Invalid request data" }, { status: 400 })
  }
}
