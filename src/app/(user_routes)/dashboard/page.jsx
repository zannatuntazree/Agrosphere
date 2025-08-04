"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCloud, FiShoppingCart, FiArrowRight } from "react-icons/fi"
import { FaSeedling } from "react-icons/fa"


const bentoBoxes = [
  {
    id: "expenses",
    title: "Financial Overview",
    description: "Track your earnings, expenses and net profit",
    icon: FiDollarSign,
    gradient: "from-blue-400 via-sky-500 to-sky-600 ",
    route: "/expensetracker",
  },
  {
    id: "weather",
    title: "Weather",
    description: "Current weather and forecasts",
    icon: FiCloud,
    gradient: "from-amber-400 via-orange-500 to-orange-600",
    route: null,
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Buy and sell agricultural products",
    icon: FiShoppingCart,
    gradient: "from-violet-400 via-purple-500 to-purple-600",
    route: null,
  },
  {
    id: "current-season",
    title: "Current Season Crops",
    description: "Recommended crops for current season",
    icon: FaSeedling,
    gradient: "from-emerald-400 via-emerald-500 to-emerald-600",
    route: null,
  },
]

export default function DashboardPage() {
  const [expenseData, setExpenseData] = useState(null)
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchExpenseData()
  }, [])

  const fetchExpenseData = async () => {
    try {
      const response = await fetch("/api/expenses", {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setExpenseData(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching expense data:", error)
    } finally {
      setIsLoadingExpenses(false)
    }
  }

  const handleBoxClick = (box) => {
    if (box.route) {
      router.push(box.route)
    }
  }

  const renderExpenseContent = () => {
    if (isLoadingExpenses) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-white/30 border-t-white"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 border-3 border-white/10"></div>
          </div>
        </div>
      )
    }

    const earnings = expenseData?.currentMonth?.earning || 0
    const expenses = expenseData?.currentMonth?.expense || 0
    const net = earnings - expenses
    const isPositiveNet = net >= 0

    return (
      <div className="space-y-4">
        {/* Financial Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Earnings */}
          <div className="bg-white/8 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/15 dark:border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 dark:bg-green-300 rounded-full"></div>
              <p className="text-xs text-black dark:text-white/70 uppercase tracking-wide font-medium">Earnings</p>
            </div>
            <p className="text-xl font-bold text-black dark:text-green-200">
              ৳ {earnings.toLocaleString()}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white/8 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/15 dark:border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-400 dark:bg-red-300 rounded-full"></div>
              <p className="text-xs text-black dark:text-white/70 uppercase tracking-wide font-medium">Expenses</p>
            </div>
            <p className="text-xl font-bold text-black dark:text-red-200">
              ৳ {expenses.toLocaleString()}
            </p>
          </div>

          {/* Net Profit/Loss */}
          <div className="bg-white/8 dark:bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/15 dark:border-white/8">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isPositiveNet ? 'bg-emerald-400 dark:bg-emerald-300' : 'bg-orange-400 dark:bg-orange-300'}`}></div>
              <p className="text-xs text-black dark:text-white/70 uppercase tracking-wide font-medium">Net</p>
            </div>
            <p className={`text-xl font-bold ${isPositiveNet ? 'text-black dark:text-emerald-200' : 'text-orange-300 dark:text-orange-200'}`}>
              {isPositiveNet ? '+' : ''}৳ {net.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly Comparison */}
        {expenseData?.monthlyComparison && (
          <div className="bg-white/5 dark:bg-white/3 backdrop-blur-sm rounded-xl p-3 border border-white/8 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${expenseData.monthlyComparison.isPositive ? 'bg-green-500/15 dark:bg-green-500/10' : 'bg-red-500/15 dark:bg-red-500/10'}`}>
                  {expenseData.monthlyComparison.isPositive ? (
                    <FiTrendingUp className="h-4 w-4 text-green-400 dark:text-green-300" />
                  ) : (
                    <FiTrendingDown className="h-4 w-4 text-red-400 dark:text-red-300" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${expenseData.monthlyComparison.isPositive ? 'text-black dark:text-green-200' : 'text-black dark:text-red-200'}`}>
                    {expenseData.monthlyComparison.percentageChange > 0 ? "+" : ""}
                    {Math.abs(expenseData.monthlyComparison.percentageChange)}%
                  </p>
                  <p className="text-xs text-gray-800 dark:text-white/60">vs last month</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderComingSoon = (title) => (
    <div className="flex flex-col items-center justify-center h-40">
      <div className="bg-white/8 dark:bg-white/5 backdrop-blur-sm rounded-full p-4 mb-3 border border-white/15 dark:border-white/8">
        <div className="w-6 h-6 bg-white/15 dark:bg-white/10 rounded animate-pulse"></div>
      </div>
      <p className="text-white/95 dark:text-white/90 font-medium mb-1">Coming Soon</p>
      <p className="text-xs text-white/70 dark:text-white/60 text-center max-w-32">
        Feature in development
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        {/* Modern Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bentoBoxes.map((box, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                box.route ? "hover:scale-[1.02] hover:-translate-y-1" : "hover:scale-[1.01]"
              }`}
              onClick={() => handleBoxClick(box)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${box.gradient} opacity-60 dark:opacity-40`} />
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-white/3 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/3 dark:bg-white/2 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>

              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-white/15 dark:bg-white/10 backdrop-blur-sm text-gray-900 dark:text-white border border-white/20 dark:border-white/10 group-hover:bg-white/25 dark:group-hover:bg-white/15 transition-colors duration-300">
                      <box.icon className="h-6 w-6 " />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-black dark:text-white mb-1">
                        {box.title}
                      </CardTitle>
                      <CardDescription className="text-black dark:text-white/80 text-sm leading-relaxed">
                        {box.description}
                      </CardDescription>
                    </div>
                  </div>
                  {box.route && (
                    <div className="p-2 rounded-lg bg-white/8 dark:bg-white/5 backdrop-blur-sm border border-white/15 dark:border-white/8 group-hover:bg-white/15 dark:group-hover:bg-white/10 group-hover:translate-x-1 transition-all duration-300">
                      <FiArrowRight className="h-5 w-5 text-shadow-gray-900 dark:text-white/80" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="relative z-10 pt-0">
                {box.id === "expenses" ? renderExpenseContent() : renderComingSoon(box.title)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}