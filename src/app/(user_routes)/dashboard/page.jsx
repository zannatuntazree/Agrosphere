"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, BarChart3, Settings } from "lucide-react"

const bentoBoxes = [
  {
    title: "Farm Analytics",
    description: "Track your farm performance and yield data",
    icon: TrendingUp,
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    title: "Community",
    description: "Connect with other farmers and experts",
    icon: Users,
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    title: "Market Insights",
    description: "Get real-time market prices and trends",
    icon: BarChart3,
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    title: "Farm Management",
    description: "Manage your crops, livestock, and resources",
    icon: Settings,
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your farming dashboard. Manage your agricultural activities here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bentoBoxes.map((box, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <div className={`absolute inset-0 ${box.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

            <CardHeader className="relative">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${box.color} text-white`}>
                  <box.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">{box.title}</CardTitle>
                  <CardDescription className="text-sm">{box.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p className="text-center">Content will be added later</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}