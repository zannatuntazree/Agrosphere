"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { FaSeedling } from "react-icons/fa"
import { FiCalendar, FiEdit, FiMapPin, FiPlus, FiTrash2, FiTrendingUp, FiUsers } from "react-icons/fi"

// Crop emojis
const cropEmojis = {
  "Rice": "🍚", "Wheat": "🌾", "Maize": "🌽", "Potato": "🥔", "Onion": "🧅",
  "Garlic": "🧄", "Chili": "🌶️", "Tomato": "🍅", "Vegetables": "🥬",
  "Fruits": "🍎", "Spices": "🌿", "Jute": "🌾", "Mustard": "🟡",
  "default": "🌱"
}

const getCropEmoji = (cropName) => {
  return cropEmojis[cropName] || cropEmojis.default
}

// Seasons
const seasons = ["Winter", "Spring", "Summer", "Monsoon"]
const statuses = ["planned", "planted", "harvested", "cancelled"]
const yieldUnits = ["kg", "ton", "quintal", "maund"]

export default function CropPlanningPage() {
  const [cropPlans, setCropPlans] = useState([])
  const [publicPlans, setPublicPlans] = useState([])
  const [userLands, setUserLands] = useState([])
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("my-plans") // my-plans, public-plans
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    season: "",
    status: "",
    crop_name: "",
    location: ""
  })
  
  const [formData, setFormData] = useState({
    land_id: "",
    crop_name: "",
    season: "",
    planting_date: "",
    expected_harvest_date: "",
    estimated_yield: "",
    yield_unit: "kg",
    notes: ""
  })

  useEffect(() => {
    fetchData()
    fetchRecommendations()
    fetchUserLands()
  }, [])

  useEffect(() => {
    if (activeTab === "my-plans") {
      fetchCropPlans()
    } else {
      fetchPublicPlans()
    }
  }, [activeTab, filters])

  const fetchData = async () => {
    await Promise.all([
      fetchCropPlans(),
      fetchPublicPlans()
    ])
  }

  const fetchCropPlans = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (filters.season) params.append("season", filters.season)
      if (filters.status) params.append("status", filters.status)
      
      const response = await fetch(`/api/crop-plans?${params}`, {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setCropPlans(result.cropPlans || [])
      } else {
        setError(result.message || "Failed to fetch crop plans")
      }
    } catch (error) {
      console.error("Error fetching crop plans:", error)
      setError("Network error occurred while fetching crop plans")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPublicPlans = async () => {
    try {
      const params = new URLSearchParams({ public: "true" })
      if (filters.season) params.append("season", filters.season)
      if (filters.crop_name) params.append("crop_name", filters.crop_name)
      if (filters.location) params.append("location", filters.location)
      
      const response = await fetch(`/api/crop-plans?${params}`, {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setPublicPlans(result.cropPlans || [])
      }
    } catch (error) {
      console.error("Error fetching public plans:", error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/crop-plans/recommendations", {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setRecommendations(result)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    }
  }

  const fetchUserLands = async () => {
    try {
      const response = await fetch("/api/lands", {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setUserLands(result.lands || [])
      }
    } catch (error) {
      console.error("Error fetching user lands:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const url = editingPlan ? `/api/crop-plans/${editingPlan.id}` : "/api/crop-plans"
      const method = editingPlan ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        resetForm()
        setIsCreateDialogOpen(false)
        setEditingPlan(null)
        fetchCropPlans()
      } else {
        console.error("Failed to save crop plan:", result.message)
      }
    } catch (error) {
      console.error("Error saving crop plan:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      land_id: "",
      crop_name: "",
      season: "",
      planting_date: "",
      expected_harvest_date: "",
      estimated_yield: "",
      yield_unit: "kg",
      notes: ""
    })
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      land_id: plan.land_id || "",
      crop_name: plan.crop_name,
      season: plan.season,
      planting_date: plan.planting_date || "",
      expected_harvest_date: plan.expected_harvest_date || "",
      estimated_yield: plan.estimated_yield || "",
      yield_unit: plan.yield_unit || "kg",
      notes: plan.notes || ""
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (planId) => {
    if (!confirm("Are you sure you want to delete this crop plan?")) return

    try {
      const response = await fetch(`/api/crop-plans/${planId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        fetchCropPlans()
      } else {
        console.error("Failed to delete crop plan:", result.message)
      }
    } catch (error) {
      console.error("Error deleting crop plan:", error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "planted": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "harvested": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Crop Planning</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan your seasonal crops and view others' harvest plans</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setEditingPlan(null)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FiPlus className="h-4 w-4" />
              Plan Crop
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Crop Plan" : "Create New Crop Plan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Land (Optional)</label>
                <select
                  value={formData.land_id}
                  onChange={(e) => setFormData({...formData, land_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a land</option>
                  {userLands.map(land => (
                    <option key={land.id} value={land.id}>
                      {land.land_type} - {land.area} acres
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Crop Name *</label>
                <input
                  type="text"
                  value={formData.crop_name}
                  onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Season *</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({...formData, season: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select season</option>
                  {seasons.map(season => (
                    <option key={season} value={season}>{season}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Planting Date</label>
                  <input
                    type="date"
                    value={formData.planting_date}
                    onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Expected Harvest</label>
                  <input
                    type="date"
                    value={formData.expected_harvest_date}
                    onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Estimated Yield</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_yield}
                    onChange={(e) => setFormData({...formData, estimated_yield: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <select
                    value={formData.yield_unit}
                    onChange={(e) => setFormData({...formData, yield_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {yieldUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seasonal Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <FaSeedling className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {recommendations.currentSeason} Season Recommendations
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.recommendedCrops.map((crop, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
              >
                {getCropEmoji(crop)}
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("my-plans")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "my-plans"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          My Plans
        </button>
        <button
          onClick={() => setActiveTab("public-plans")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "public-plans"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Community Plans
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.season}
          onChange={(e) => setFilters({...filters, season: e.target.value})}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Seasons</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
        
        {activeTab === "my-plans" && (
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        )}
        
        {activeTab === "public-plans" && (
          <>
            <input
              type="text"
              placeholder="Search crops..."
              value={filters.crop_name}
              onChange={(e) => setFilters({...filters, crop_name: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {(activeTab === "my-plans" ? cropPlans : publicPlans).map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{getCropEmoji(plan.crop_name)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.crop_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{plan.season}</p>
                  </div>
                </div>
                
                {activeTab === "my-plans" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status (for my plans) */}
              {activeTab === "my-plans" && (
                <div className="mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </div>
              )}

              {/* Farmer info (for public plans) */}
              {activeTab === "public-plans" && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <FiUsers className="h-4 w-4" />
                  <span>{plan.farmer_name}</span>
                  {plan.farmer_area && <span>• {plan.farmer_area}</span>}
                </div>
              )}

              {/* Dates */}
              <div className="space-y-2 mb-4">
                {plan.planting_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">Planting:</span>
                    <span>{formatDate(plan.planting_date)}</span>
                  </div>
                )}
                {plan.expected_harvest_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600 dark:text-gray-400">Harvest:</span>
                    <span>{formatDate(plan.expected_harvest_date)}</span>
                  </div>
                )}
              </div>

              {/* Yield */}
              {plan.estimated_yield && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <FiTrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600 dark:text-gray-400">Expected Yield:</span>
                  <span className="font-medium">{plan.estimated_yield} {plan.yield_unit}</span>
                </div>
              )}

              {/* Land info */}
              {plan.land_type && (
                <div className="flex items-center gap-2 text-sm mb-4">
                  <FiMapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Land:</span>
                  <span>{plan.land_type} ({plan.land_area} acres)</span>
                </div>
              )}

              {/* Notes (for my plans only) */}
              {activeTab === "my-plans" && plan.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && (activeTab === "my-plans" ? cropPlans : publicPlans).length === 0 && !error && (
        <div className="text-center py-12">
          <FaSeedling className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {activeTab === "my-plans" ? "No crop plans yet" : "No community plans found"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {activeTab === "my-plans" 
              ? "Start planning your seasonal crops" 
              : "Check back later for community crop plans"
            }
          </p>
          {activeTab === "my-plans" && (
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Plan
            </button>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
