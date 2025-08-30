import { NextResponse } from "next/server"
import { cropPlanController } from "@/backend/controllers/cropPlanController.js"

// POST - Send planting reminders to users with upcoming planting dates
export async function POST(request) {
  try {
    // This endpoint could be called by a scheduled job or admin
    // For now, we'll allow any authenticated user to trigger it
    // In production, you might want to restrict this to admins only

    const result = await cropPlanController.sendPlantingReminders()

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Send planting reminders API error:", error)
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