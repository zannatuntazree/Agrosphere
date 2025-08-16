"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { getUserFromStorage } from "@/lib/auth"

import FindFarmersTab from "./_components/find-farmers"
import RequestsTab from "./_components/request-tab"
import ConnectionsTab from "./_components/my-connections"

const tabs = [
  { id: "nearby", label: "Find Farmers" },
  { id: "requests", label: "Requests" },
  { id: "connections", label: "My Connections" },
];

export default function NearbyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [connectionRequests, setConnectionRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchType, setSearchType] = useState("area")
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("nearby")

  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setCurrentUser(user)
      fetchNearbyFarmers()
    }
    fetchConnectionRequests()
    fetchConnections()
  }, [])

  const fetchData = async (url, setData, entityName) => {
    try {
      setIsLoading(true)
      const response = await fetch(url, { credentials: "include" })
      const result = await response.json()

      if (response.ok && result.success) {
        setData(result.farmers || result.requests || result.connections || [])
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
  const fetchConnectionRequests = () => fetchData("/api/user-connections?type=all", setConnectionRequests, "connection requests")
  const fetchConnections = () => fetchData("/api/user-connections/friends", setConnections, "connections")

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
    fetchConnectionRequests()
    fetchConnections()
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

  const receivedRequestsCount = connectionRequests.filter(
    req => req.request_direction === 'received' && req.status === 'pending'
  ).length

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Connect with Users
          </h1>
        </div>
      </div>

      {/* Tab Navigation*/}
      <div className="relative w-full sm:w-[70%] lg:w-[50%] flex space-x-1 bg-gray-200 dark:bg-gray-800 rounded-full p-1">
        <motion.div
          className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-full shadow-sm"
          initial={false}
          animate={{
            x: `${tabs.findIndex((tab) => tab.id === activeTab) * 96}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          style={{ width: `calc(100% / ${tabs.length})` }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
            {tab.id === "requests" && receivedRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full ml-1">
                {receivedRequestsCount}
              </span>
            )}
          </button>
        ))}
      </div>
        
      {/* Tab Content */}
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'nearby' && (
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
            )}
            {activeTab === 'requests' && (
              <RequestsTab
                requests={connectionRequests}
                handleResponse={respondToRequest}
                navigateToProfile={navigateToProfile} isLoading={undefined}              />
            )}
            {activeTab === 'connections' && (
               <ConnectionsTab
                connections={connections}
                // @ts-ignore
                navigateToProfile={navigateToProfile}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}