import { NextResponse } from "next/server"
import { weatherController } from "@/backend/controllers/weatherController.js"

// POST - Check and send weather alerts to all users
export async function POST(request) {
  try {
    // This endpoint could be called by a scheduled job or admin
    // For demo purposes, we'll allow authenticated users to trigger it
    // In production, you might want to restrict this to admins only or use a cron job

    const result = await weatherController.checkAndSendWeatherAlerts()

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Weather alerts API error:", error)
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