"use client"

// @ts-ignore
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiPlus, FiTrendingUp, FiTrendingDown, FiTrash2, FiDollarSign } from "react-icons/fi"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Expense categories
const expenseCategories = [
  "Fertilizer",
  "Seeds",
  "Irrigation",
  "Labor",
  "Pest Control",
  "Machinery Rent",
  "Fuel",
  "Equipment",
  "Insurance",
  "Others",
]

// Earning categories
const earningCategories = [
  "Selling Crops",
  "Renting Items",
  "Consulting",
  "Government Subsidies",
  "Contract Farming",
  "Livestock Sales",
  "Others",
]

// Animated number component
const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000 // 1 second
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  )
}

export default function ExpenseTrackerPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showCurrentMonth, setShowCurrentMonth] = useState(true)
  const [showMonthlyChart, setShowMonthlyChart] = useState(true)
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [isYearlyLoading, setIsYearlyLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/expenses", {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDashboardData(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setIsDialogOpen(false)
          setFormData({
            type: "expense",
            category: "",
            amount: "",
            description: "",
            date: new Date().toISOString().split("T")[0],
          })
          fetchDashboardData() // Refresh data
        }
      }
    } catch (error) {
      console.error("Error creating expense/earning:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchDashboardData() 
      }
    } catch (error) {
      console.error("Error deleting expense/earning:", error)
    }
  }

  const handleYearChange = async (year) => {
    setSelectedYear(year)
    setIsYearlyLoading(true)

    // Fetch yearly data for the selected year
    try {
      const response = await fetch(`/api/expenses/yearly/${year}`, {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update the dashboard data with the new yearly data
          setDashboardData((prev) => ({
            ...prev,
            yearlyData: result.data,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching yearly data:", error)
    } finally {
      setIsYearlyLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const currentData = showCurrentMonth ? dashboardData?.currentMonth : dashboardData?.last7Days
  const chartData = showMonthlyChart ? dashboardData?.last6Months : dashboardData?.last6Years

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Expense Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your farm expenses and earnings to manage your finances effectively
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
        
          <FiPlus 
// @ts-ignore
          className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 3 boxes */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Month/Last 7 Days */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showCurrentMonth ? "Current Month" : "Last 7 Days"}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!showCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                  7D
                </span>
                <button
                  onClick={() => setShowCurrentMonth(!showCurrentMonth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showCurrentMonth ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCurrentMonth ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-sm ${showCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                  Month
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingUp 
// @ts-ignore
                  className="h-5 w-5 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Earnings</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  $<AnimatedNumber value={currentData?.earning || 0} />
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingDown 
// @ts-ignore
                  className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600 dark:text-gray-400">Expenses</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  $<AnimatedNumber value={currentData?.expense || 0} />
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Net</span>
                  <span
                    className={`text-xl font-bold ${
                      (currentData?.earning || 0) - (currentData?.expense || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    $<AnimatedNumber value={(currentData?.earning || 0) - (currentData?.expense || 0)} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yearly Overview</h3>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number.parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {dashboardData?.availableYears?.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {isYearlyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                    <span className="text-lg font-bold text-green-600">
                      $<AnimatedNumber value={dashboardData?.yearlyData?.earning || 0} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                    <span className="text-lg font-bold text-red-600">
                      $<AnimatedNumber value={dashboardData?.yearlyData?.expense || 0} />
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Net Income</span>
                      <span
                        className={`text-lg font-bold ${
                          (dashboardData?.yearlyData?.earning || 0) - (dashboardData?.yearlyData?.expense || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        $
                        <AnimatedNumber
                          value={(dashboardData?.yearlyData?.earning || 0) - (dashboardData?.yearlyData?.expense || 0)}
                        />
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">Year: {selectedYear}</div>
                </>
              )}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Insights</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    dashboardData?.monthlyComparison?.isPositive
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  {dashboardData?.monthlyComparison?.isPositive ? (
                    // @ts-ignore
                    <FiTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    // @ts-ignore
                    <FiTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-lg font-bold ${
                      dashboardData?.monthlyComparison?.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {dashboardData?.monthlyComparison?.percentageChange > 0 ? "+" : ""}
                    {Math.abs(dashboardData?.monthlyComparison?.percentageChange || 0)}%
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">vs last month</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">This month net:</span>
                  <span
                    className={`font-medium ${
                      (dashboardData?.monthlyComparison?.currentMonthNet || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(dashboardData?.monthlyComparison?.currentMonthNet || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Last month net:</span>
                  <span
                    className={`font-medium ${
                      (dashboardData?.monthlyComparison?.previousMonthNet || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(dashboardData?.monthlyComparison?.previousMonthNet || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {dashboardData?.monthlyComparison?.suggestion}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showMonthlyChart ? "Last 6 Months" : "Last 6 Years"}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${!showMonthlyChart ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                  Years
                </span>
                <button
                  onClick={() => setShowMonthlyChart(!showMonthlyChart)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showMonthlyChart ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showMonthlyChart ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-sm ${showMonthlyChart ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                  Months
                </span>
              </div>
            </div>

            {/* Dynamic height based on data length */}
            <div
              className={`${
                chartData && chartData.length <= 3 ? "h-64" : chartData && chartData.length <= 6 ? "h-72" : "h-80"
              }`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <
// @ts-ignore
                  XAxis
                    dataKey={showMonthlyChart ? "month" : "year"}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#d1d5db" }}
                  />
                  <
// @ts-ignore
                  YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      `$${value.toLocaleString()}`,
                      name === "earning" ? "Earnings" : "Expenses",
                    ]}
                    labelFormatter={(label) => `${showMonthlyChart ? "Month" : "Year"}: ${label}`}
                    cursor={{ fill: "transparent" }}
                  />
                  <
// @ts-ignore
                  Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                  <
// @ts-ignore
                  Bar dataKey="earning" fill="#10b981" name="Earnings" radius={[2, 2, 0, 0]} />
                  <
// @ts-ignore
                  Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Summary */}
            {chartData && chartData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${chartData.reduce((sum, item) => sum + (item.earning || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Total Expenses</p>
                    <p className="text-lg font-semibold text-red-600">
                      ${chartData.reduce((sum, item) => sum + (item.expense || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last {dashboardData?.recentTransactions?.length || 0} transactions
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {dashboardData?.recentTransactions?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <FiDollarSign 
// @ts-ignore
                    className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Start by adding your first expense or earning
                  </p>
                </div>
              ) : (
                dashboardData?.recentTransactions?.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          transaction.type === "earning"
                            ? "bg-green-100 dark:bg-green-900/50"
                            : "bg-red-100 dark:bg-red-900/50"
                        }`}
                      >
                        {transaction.type === "earning" ? (
                          // @ts-ignore
                          <FiTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          // @ts-ignore
                          <FiTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-semibold ${
                              transaction.type === "earning" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "earning" ? "+" : "-"}${transaction.amount}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{transaction.category}</p>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{transaction.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete transaction"
                    >
                      <FiTrash2 
// @ts-ignore
                      className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense/Earning Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsDialogOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Add {formData.type === "expense" ? "Expense" : "Earning"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="expense"
                          checked={formData.type === "expense"}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value, category: "" })}
                          className="mr-2"
                        />
                        <span className="text-red-600">Expense</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="earning"
                          checked={formData.type === "earning"}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value, category: "" })}
                          className="mr-2"
                        />
                        <span className="text-green-600">Earning</span>
                      </label>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select category</option>
                      {(formData.type === "expense" ? expenseCategories : earningCategories).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Add a note..."
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add {formData.type === "expense" ? "Expense" : "Earning"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
