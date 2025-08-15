"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { FiCloud, FiCloudRain, FiDroplet, FiEye, FiRefreshCw, FiSun, FiWind } from "react-icons/fi"

// Mock weather data for demonstration
const mockWeatherData = {
  current: {
    location: "Dhaka, Bangladesh",
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    uvIndex: 6,
    icon: "partly-cloudy"
  },
  forecast: [
    { day: "Today", high: 32, low: 25, condition: "Partly Cloudy", icon: "partly-cloudy", precipitation: 10 },
    { day: "Tomorrow", high: 30, low: 24, condition: "Sunny", icon: "sunny", precipitation: 0 },
    { day: "Wednesday", high: 28, low: 22, condition: "Rain", icon: "rainy", precipitation: 80 },
    { day: "Thursday", high: 26, low: 20, condition: "Thunderstorm", icon: "thunderstorm", precipitation: 90 },
    { day: "Friday", high: 29, low: 23, condition: "Cloudy", icon: "cloudy", precipitation: 20 }
  ],
  farmingRecommendations: [
    {
      title: "Good time for planting",
      description: "Current soil moisture levels are ideal for rice planting",
      type: "positive"
    },
    {
      title: "Rain expected midweek",
      description: "Postpone fertilizer application until Friday",
      type: "warning"
    },
    {
      title: "Monitor pest activity",
      description: "High humidity may increase pest activity. Check crops regularly",
      type: "info"
    }
  ]
}

const weatherIcons = {
  "sunny": FiSun,
  "partly-cloudy": FiCloud,
  "cloudy": FiCloud,
  "rainy": FiCloudRain,
  "thunderstorm": FiCloudRain
}

const getWeatherIcon = (iconType) => {
  return weatherIcons[iconType] || FiCloud
}

const getRecommendationColor = (type) => {
  switch (type) {
    case "positive": return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
    case "warning": return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
    case "info": return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
    default: return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
  }
}

const getRecommendationTextColor = (type) => {
  switch (type) {
    case "positive": return "text-green-800 dark:text-green-200"
    case "warning": return "text-yellow-800 dark:text-yellow-200"
    case "info": return "text-blue-800 dark:text-blue-200"
    default: return "text-gray-800 dark:text-gray-200"
  }
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, you would call a weather API here
      // const response = await fetch('/api/weather')
      // const data = await response.json()
      
      setWeatherData(mockWeatherData)
      setLastUpdated(new Date())
      setError(null)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("Failed to fetch weather data")
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Current Weather Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Forecast Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
              <Skeleton className="h-6 w-20 mx-auto mb-4" />
              <Skeleton className="h-12 w-12 mx-auto mb-4" />
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <FiCloud className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Weather Data Unavailable</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchWeatherData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Weather & Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {formatTime(lastUpdated)}
          </p>
        </div>
        
        <button
          onClick={fetchWeatherData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Current Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-8 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {weatherData.current.temperature}°C
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">{weatherData.current.condition}</p>
            <p className="text-gray-600 dark:text-gray-400">{weatherData.current.location}</p>
          </div>
          <div className="text-6xl text-blue-600 dark:text-blue-400">
            {(() => {
              const IconComponent = getWeatherIcon(weatherData.current.icon)
              return <IconComponent />
            })()}
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <FiDroplet className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{weatherData.current.humidity}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
          </div>
          
          <div className="text-center">
            <FiWind className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{weatherData.current.windSpeed} km/h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
          </div>
          
          <div className="text-center">
            <FiEye className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{weatherData.current.visibility} km</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
          </div>
          
          <div className="text-center">
            <FiSun className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{weatherData.current.uvIndex}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">UV Index</p>
          </div>
        </div>
      </motion.div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{day.day}</h4>
              
              <div className="text-4xl text-blue-600 dark:text-blue-400 mb-4">
                {(() => {
                  const IconComponent = getWeatherIcon(day.icon)
                  return <IconComponent />
                })()}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{day.high}°</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">{day.low}°</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{day.condition}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <FiDroplet className="h-3 w-3" />
                  <span>{day.precipitation}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Farming Recommendations */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Farming Recommendations</h3>
        <div className="space-y-4">
          {weatherData.farmingRecommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-6 border ${getRecommendationColor(recommendation.type)}`}
            >
              <h4 className={`font-semibold mb-2 ${getRecommendationTextColor(recommendation.type)}`}>
                {recommendation.title}
              </h4>
              <p className={`${getRecommendationTextColor(recommendation.type)} opacity-90`}>
                {recommendation.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Integration Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FiCloud className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Demo Weather Data
            </h4>
            <p className="text-yellow-700 dark:text-yellow-300">
              This page shows demo weather data. In production, this would integrate with weather APIs like 
              OpenWeatherMap, AccuWeather, or local meteorological services to provide real-time weather 
              information and farming-specific alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
