"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Users, UserPlus, Clock, Check, X, Phone, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function NearbyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [farmers, setFarmers] = useState([])
  const [connectionRequests, setConnectionRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchLocation, setSearchLocation] = useState("")
  const [searchArea, setSearchArea] = useState("")
  const [activeTab, setActiveTab] = useState("nearby")

  useEffect(() => {
    fetchConnectionRequests()
    fetchConnections()
    fetchAllFarmers() // Load all farmers initially
  }, [])

  const fetchAllFarmers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/findnearbyuser", {
        credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setFarmers(result.farmers || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch farmers",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast({
        title: "Network Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchFarmers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchLocation) params.append("location", searchLocation)
      if (searchArea) params.append("area", searchArea)
      
      const response = await fetch(`/api/findnearbyuser?${params}`, {
        credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setFarmers(result.farmers || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to search farmers",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error searching farmers:", error)
      toast({
        title: "Network Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch("/api/user-connections?type=all", {
        credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setConnectionRequests(result.requests || [])
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error)
    }
  }

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user-connections/friends", {
        credentials: "include"
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setConnections(result.connections || [])
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
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
        // Refresh the farmers list to reflect the new status
        if (searchLocation || searchArea) {
          searchFarmers()
        } else {
          fetchAllFarmers()
        }
        fetchConnectionRequests()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send connection request",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Network Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const respondToRequest = async (connectionId, response) => {
    try {
      const res = await fetch(`/api/user-connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response })
      })
      const result = await res.json()

      if (res.ok && result.success) {
        toast({
          title: "Success",
          description: `Connection request ${response}!`,
        })
        fetchConnectionRequests()
        fetchConnections()
        // Refresh the farmers list
        if (searchLocation || searchArea) {
          searchFarmers()
        } else {
          fetchAllFarmers()
        }
      } else {
        toast({
          title: "Error",
          description: result.message || `Failed to ${response} connection request`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error responding to connection request:", error)
      toast({
        title: "Network Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const clearSearch = () => {
    setSearchLocation("")
    setSearchArea("")
    fetchAllFarmers()
  }

  const navigateToProfile = (userId) => {
    router.push(`/profile/${userId}`)
  }

  const getConnectionStatus = (user) => {
    if (user.connection_status === 'pending') {
      return user.request_direction === 'sent' ? 'Request Sent' : 'Request Received'
    } else if (user.connection_status === 'accepted') {
      return 'Connected'
    }
    return null
  }

  const canSendRequest = (user) => {
    return !user.connection_status
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-green-600" />
        <h1 className="text-3xl font-bold">Find Farmers</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nearby">Find Farmers</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="nearby" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search for Farmers
              </CardTitle>
              <CardDescription>
                Find farmers by location or browse all farmers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Location (City, District)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Dhaka, Chittagong"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area (Optional)</Label>
                  <Input
                    id="area"
                    placeholder="e.g., Dhanmondi, Gulshan"
                    value={searchArea}
                    onChange={(e) => setSearchArea(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={searchFarmers}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button 
                    onClick={clearSearch}
                    disabled={isLoading}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.map((farmer) => (
                    <Card key={farmer.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div 
                          className="flex items-start gap-3" 
                          onClick={() => navigateToProfile(farmer.id)}
                        >
                          <Avatar>
                            <AvatarImage src={farmer.profile_pic} />
                            <AvatarFallback>
                              {farmer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate hover:text-blue-600">{farmer.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {farmer.area && farmer.city ? `${farmer.area}, ${farmer.city}` : farmer.area || farmer.city || 'Location not specified'}
                            </p>
                            {farmer.country && (
                              <p className="text-sm text-gray-500">
                                {farmer.country}
                              </p>
                            )}
                            {farmer.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {farmer.phone}
                              </p>
                            )}
                            {farmer.age && (
                              <p className="text-sm text-gray-500">
                                Age: {farmer.age}
                              </p>
                            )}
                            {farmer.preferred_crops && farmer.preferred_crops.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {farmer.preferred_crops.slice(0, 2).map((crop, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {crop}
                                  </Badge>
                                ))}
                                {farmer.preferred_crops.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{farmer.preferred_crops.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {canSendRequest(farmer) ? (
                            <Button 
                              size="sm" 
                              onClick={() => sendConnectionRequest(farmer.id)}
                              className="flex-1"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                          ) : (
                            <Badge 
                              variant={farmer.connection_status === 'accepted' ? 'default' : 'secondary'}
                              className="flex-1 justify-center py-1"
                            >
                              {getConnectionStatus(farmer)}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {farmers.length === 0 && !isLoading && (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    {searchLocation || searchArea ? 'No farmers found in this location' : 'No farmers found'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {searchLocation || searchArea ? 'Try searching a different location' : 'Try using the search feature above'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Connection Requests
              </CardTitle>
              <CardDescription>
                Manage your pending connection requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionRequests.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No connection requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connectionRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div 
                        className="flex items-center gap-3 flex-1" 
                        onClick={() => navigateToProfile(request.other_user_id)}
                      >
                        <Avatar>
                          <AvatarImage src={request.other_user_profile_pic} />
                          <AvatarFallback>
                            {request.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold hover:text-blue-600">{request.other_user_name}</h3>
                          <p className="text-sm text-gray-600">{request.other_user_area}</p>
                          <p className="text-xs text-gray-500">
                            {request.request_direction === 'sent' ? 'Request sent' : 'Request received'} • 
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'accepted' ? 'default' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                        {request.status === 'pending' && request.request_direction === 'received' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => respondToRequest(request.id, 'accepted')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => respondToRequest(request.id, 'rejected')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Connections
              </CardTitle>
              <CardDescription>
                Farmers you're connected with
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No connections yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Find nearby farmers to start connecting
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connection) => (
                    <Card 
                      key={connection.connection_id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigateToProfile(connection.friend_info.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={connection.friend_info.profile_pic} />
                            <AvatarFallback>
                              {connection.friend_info.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate hover:text-blue-600">{connection.friend_info.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {connection.friend_info.area}, {connection.friend_info.city}
                            </p>
                            {connection.friend_info.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {connection.friend_info.phone}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Connected since {new Date(connection.connected_since).toLocaleDateString()}
                            </p>
                            {connection.friend_info.preferred_crops && connection.friend_info.preferred_crops.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {connection.friend_info.preferred_crops.slice(0, 2).map((crop, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {crop}
                                  </Badge>
                                ))}
                                {connection.friend_info.preferred_crops.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{connection.friend_info.preferred_crops.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
