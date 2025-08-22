import { forgotPassword } from "../../../../controllers/authController"

export async function POST(request) {
  return await forgotPassword(request, {
    status: (code) => ({
      json: (data) => Response.json(data, { status: code }),
    }),
  })
}
