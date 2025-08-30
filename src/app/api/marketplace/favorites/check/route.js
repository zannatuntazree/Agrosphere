import { NextResponse } from "next/server"
import { marketplaceFavoritesController } from "@/backend/controllers/marketplaceFavoritesController.js"

// GET - Check if listing is favorited by user
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listingId")

    if (!listingId) {
      return NextResponse.json({ success: false, message: "Listing ID is required" }, { status: 400 })
    }

    // If not authenticated, return false
    if (!authToken) {
      return NextResponse.json({ success: true, isFavorited: false }, { status: 200 })
    }

    const result = await marketplaceFavoritesController.checkFavoriteStatus(authToken, listingId)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Check favorite status API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}