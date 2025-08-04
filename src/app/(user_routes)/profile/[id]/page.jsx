// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import { FiEdit, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiMap, FiLayers, FiMessageSquare,  FiTrendingUp } from "react-icons/fi"
import { FaSeedling } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton"
import EditProfileDialog from "./_components/editprofile"
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", { credentials: "include" })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUser(result.user)
          } else {
            console.error("API error fetching profile:", result.message)
            setUser(null)
          }
        } else {
          console.error("HTTP error fetching profile:", response.status)
          setUser(null)
        }
      } catch (error) {
        console.error("Network error fetching profile:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserProfile()
  }, [])

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
    // The toast is now handled by the Dialog component
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
        {/* Profile section skeleton - full width */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-green-200 dark:border-slate-700 shadow-lg dark:shadow-2xl mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg" />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
                </div>
                <Skeleton className="h-10 w-32 mt-4 sm:mt-0" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats cards skeleton - 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="text-center">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400">Could not load user profile.</p>
        <p className="text-gray-500">Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Profile Section - Full Width */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-green-200 dark:border-slate-700 shadow-lg dark:shadow-2xl mb-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full shadow-lg">
            {user.profile_pic ? (
              <Image
                  src={user.profile_pic}
                  alt={user.name}
                  width={200} 
                  height={200}
                  className="aspect-square h-full w-full object-cover"
                />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-green-600 text-white">
                <span className="text-3xl font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-700 dark:text-gray-300">
                  <FiMail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <FiCalendar className="h-4 w-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsEditDialogOpen(true)} 
                className="inline-flex items-center justify-center rounded-full text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white  hover:-translate-y-1 cursor-pointer transition-all duration-300 mt-4 sm:mt-0 shadow-md hover:shadow-lg"
              >
                <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-sm">
                  <FiPhone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                </div>
              </div>
            )}
            
            {user.age && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-sm">
                  <FiUser className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.age} years old</p>
                </div>
              </div>
            )}
            
            {(user.city || user.country) && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shadow-sm">
                  <FiMapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">{[user.city, user.country].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg shadow-sm">
                  <FiMapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.address}</p>
                </div>
              </div>
            )}
            
            {user.preferred_crops?.length > 0 && (
              <div className="flex items-start gap-3 lg:col-span-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-sm">
                  <FaSeedling className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preferred Crops</p>
                  <div className="flex flex-wrap gap-2">
                    {user.preferred_crops.map((crop, i) => (
                      <div key={i} className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 shadow-sm">
                        {crop}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg shadow-sm">
              <FiMap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Land Stats</h3>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-green-600">{user.landStats?.totalLands || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Properties</p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                <FiLayers className="mx-auto mb-1 h-4 w-4 text-blue-600" />
                <p className="text-xl font-bold text-blue-600">{user.landStats?.totalArea || "0.0"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Area (acres)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forum Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-sm">
              <FiMessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Forum Stats</h3>
          </div>
          
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
              <FiMessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Will be added later</p>
          </div>
        </div>

        {/* Current Season Crop */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg shadow-sm">
              <FaSeedling className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Current Season Crops</h3>
          </div>
          
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
              <FaSeedling className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Will be added later</p>
          </div>
        </div>

        {/* Productivity Statistics - New Stats Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-md dark:shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-sm">
              <FiTrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Productivity Stats</h3>
          </div>
          
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
              <FiTrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Will be added later</p>
          </div>
        </div>
      </div>

      <EditProfileDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    </div>
  )
}