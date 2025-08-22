"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { FiCloud, FiCloudRain, FiDroplet, FiEye, FiRefreshCw, FiSun, FiWind } from "react-icons/fi"

// Map weatherbit.io icon codes to React icons
const weatherIcons = {
  "t01d": FiCloudRain, "t01n": FiCloudRain, // Thunderstorm with light rain
  "t02d": FiCloudRain, "t02n": FiCloudRain, // Thunderstorm with rain
  "t03d": FiCloudRain, "t03n": FiCloudRain, // Thunderstorm with heavy rain
  "t04d": FiCloudRain, "t04n": FiCloudRain, // Thunderstorm with light drizzle
  "t05d": FiCloudRain, "t05n": FiCloudRain, // Thunderstorm with drizzle
  "d01d": FiCloudRain, "d01n": FiCloudRain, // Light drizzle
  "d02d": FiCloudRain, "d02n": FiCloudRain, // Drizzle
  "d03d": FiCloudRain, "d03n": FiCloudRain, // Heavy drizzle
  "r01d": FiCloudRain, "r01n": FiCloudRain, // Light rain
  "r02d": FiCloudRain, "r02n": FiCloudRain, // Moderate rain
  "r03d": FiCloudRain, "r03n": FiCloudRain, // Heavy rain
  "r04d": FiCloudRain, "r04n": FiCloudRain, // Freezing rain
  "r05d": FiCloudRain, "r05n": FiCloudRain, // Light shower rain
  "r06d": FiCloudRain, "r06n": FiCloudRain, // Shower rain
  "s01d": FiCloud, "s01n": FiCloud, // Light snow
  "s02d": FiCloud, "s02n": FiCloud, // Snow
  "s03d": FiCloud, "s03n": FiCloud, // Heavy snow
  "s04d": FiCloud, "s04n": FiCloud, // Mix snow/rain
  "s05d": FiCloud, "s05n": FiCloud, // Sleet
  "s06d": FiCloud, "s06n": FiCloud, // Freezing drizzle
  "a01d": FiCloud, "a01n": FiCloud, // Mist
  "a02d": FiCloud, "a02n": FiCloud, // Smoke
  "a03d": FiCloud, "a03n": FiCloud, // Haze
  "a04d": FiWind, "a04n": FiWind, // Sand/dust
  "a05d": FiCloud, "a05n": FiCloud, // Fog
  "a06d": FiCloud, "a06n": FiCloud, // Freezing fog
  "c01d": FiSun, "c01n": FiSun, // Clear sky
  "c02d": FiCloud, "c02n": FiCloud, // Few clouds
  "c03d": FiCloud, "c03n": FiCloud, // Scattered clouds
  "c04d": FiCloud, "c04n": FiCloud, // Broken clouds
}

const getWeatherIcon = (iconCode) => {
  return weatherIcons[iconCode] || FiCloud
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
    setError(null)
    
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user')
      
      if (!userData) {
        throw new Error("Please login to view weather data")
      }

      const user = JSON.parse(userData)
      const { city, country } = user

      if (!city) {
        throw new Error("Location not found in user profile. Please update your profile with location information.")
      }

      // Call the weather API
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: city,
          country: country || ""
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch weather data")
      }

      setWeatherData(result.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError(error.message)
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
        initial={{ opacity: 0}}
        animate={{ opacity: 1 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Farming Tips</h3>
        <div className="space-y-4">
          {weatherData.farmingTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-6 border ${getRecommendationColor(tip.type)}`}
            >
              <h4 className={`font-semibold mb-2 ${getRecommendationTextColor(tip.type)}`}>
                {tip.title}
              </h4>
              <p className={`${getRecommendationTextColor(tip.type)} opacity-90`}>
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  )
}
