"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { getUserFromStorage } from "@/lib/auth"

import FindFarmersTab from "./_components/find-farmers"

export default function NearbyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState("area")
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setCurrentUser(user)
      fetchNearbyFarmers()
    }
  }, [])

  const fetchData = async (url, setData, entityName) => {
    try {
      setIsLoading(true)
      const response = await fetch(url, { credentials: "include" })
      const result = await response.json()

      if (response.ok && result.success) {
        setData(result.farmers || [])
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to fetch ${entityName}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error)
      toast({
        title: "Network Error",
        description: "A network error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNearbyFarmers = () => fetchData("/api/findnearbyuser?nearby=true", setFarmers, "nearby farmers")

  const searchFarmers = async () => {
    if (!searchValue.trim()) {
      fetchNearbyFarmers()
      return
    }
    const params = new URLSearchParams({ [searchType]: searchValue.trim() }).toString()
    fetchData(`/api/findnearbyuser?${params}`, setFarmers, "farmers")
  }
  
  const refreshAllData = () => {
    if (searchValue.trim()) {
        searchFarmers()
    } else {
        fetchNearbyFarmers()
    }
  }

  const sendConnectionRequest = async (receiverId) => {
    try {
      const response = await fetch("/api/user-connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId })
      })
      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Connection request sent!",
        })
        refreshAllData()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send request",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "A network error occurred.",
        variant: "destructive"
      })
    }
  }

  const respondToRequest = async (connectionId, responseType) => {
    try {
      const res = await fetch(`/api/user-connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response: responseType })
      })
      const result = await res.json()

      if (res.ok && result.success) {
        toast({
          title: "Success",
          description: `Connection request ${responseType}!`,
        })
        refreshAllData()
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${responseType} request`,
          variant: "destructive"
        })
      }
    } catch (error) {
       toast({
        title: "Network Error",
        description: "A network error occurred.",
        variant: "destructive"
      })
    }
  }

  const clearSearch = () => {
    setSearchValue("")
    fetchNearbyFarmers()
  }

  const navigateToProfile = (userId) => {
    router.push(`/profile/${userId}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Find Nearby Farmers
          </h1>
          <p className="text-muted-foreground">
            Discover and connect with farmers in your area
          </p>
        </div>
      </div>

      {/* Content */}
      <div>
        <FindFarmersTab
          farmers={farmers}
          isLoading={isLoading}
          searchType={searchType}
          setSearchType={setSearchType}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleSearch={searchFarmers}
          clearSearch={clearSearch}
          sendRequest={sendConnectionRequest}
          navigateToProfile={navigateToProfile}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}