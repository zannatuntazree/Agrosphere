"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, DollarSign } from "lucide-react"

export default function StatsTab({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Total Users */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Total Users</CardTitle>
          <Users className="h-8 w-8 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.totalUsers.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Registered farmers</p>
        </CardContent>
      </Card>

      {/* Total Lands */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Total Lands</CardTitle>
          <MapPin className="h-8 w-8 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.totalLands.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Registered properties</p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Total Transactions</CardTitle>
          <DollarSign className="h-8 w-8 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-2">{loading ? "..." : stats.totalExpenses.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Expense & earning records</p>
        </CardContent>
      </Card>
    </div>
  )
}
