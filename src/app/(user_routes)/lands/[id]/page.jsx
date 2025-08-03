"use client"

// @ts-ignore
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { FiArrowLeft, FiMapPin, FiMap } from "react-icons/fi"

export default function LandDetailsPage() {
  const params = useParams()
  const [land, setLand] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchLandDetails()
    }
  }, [params.id])

  const fetchLandDetails = async () => {
    try {
      const response = await fetch(`/api/lands/${params.id}`, {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLand(result.land)
        }
      }
    } catch (error) {
      console.error("Error fetching land details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!land) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Land Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The land you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link
          href="/lands"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiArrowLeft 
// @ts-ignore
          className="h-4 w-4" />
          Back to Lands
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/lands" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <FiArrowLeft 
// @ts-ignore
          className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{land.land_type} Land</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {land.area} acres • Added {new Date(land.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {land.land_image ? (
              <img
                src={land.land_image || "/placeholder.svg"}
                alt={`${land.land_type} land`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMap 
// @ts-ignore
                className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Land Details</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">{land.land_type}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Area:</span>
                <span className="font-medium text-gray-900 dark:text-white">{land.area} acres</span>
              </div>

              {land.soil_quality && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Soil Quality:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{land.soil_quality}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Added:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(land.created_at).toLocaleDateString()}
                </span>
              </div>

              {land.updated_at !== land.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(land.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {land.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{land.description}</p>
            </div>
          )}

          {land.tags && land.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {land.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {land.location_link && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
              <a
                href={land.location_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiMapPin 
// @ts-ignore
                className="h-4 w-4" />
                View on Map
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">More Features Coming Soon!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're working on exciting new features for land management including crop planning, yield tracking, weather
          integration, and much more.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Crop Planning
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Weather Integration
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Yield Tracking
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Financial Analytics
          </span>
        </div>
      </div>
    </div>
  )
}
