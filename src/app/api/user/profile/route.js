import { NextResponse } from "next/server"
import { userController } from "@/backend/controllers/userController.js"

export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if requesting another user's profile
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let result

    if (userId) {
      // Get another user's profile
      result = await userController.getUserProfileById(authToken, userId)
    } else {
      // Get current user's profile
      result = await userController.getUserProfile(authToken)
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = await userController.updateUserProfile(authToken, body)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
