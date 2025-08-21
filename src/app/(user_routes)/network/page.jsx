"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { FiCheck, FiSearch, FiUserPlus, FiUsers, FiX } from "react-icons/fi"

export default function NetworkPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("connections")
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchConnections()
    fetchConnectionRequests()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user-connections/friends")
      const data = await response.json()
      if (data.success) {
        setConnections(data.connections)
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    }
  }

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch("/api/user-connections?type=received")
      const data = await response.json()
      if (data.success) {
        setPendingRequests(data.requests)
      }

      const sentResponse = await fetch("/api/user-connections?type=sent")
      const sentData = await sentResponse.json()
      if (sentData.success) {
        setSentRequests(sentData.requests)
      }
    } catch (error) {
      console.error("Error fetching connection requests:", error)
    }
  }

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendConnectionRequest = async (userId) => {
    try {
      const response = await fetch("/api/user-connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Connection request sent successfully",
        })
        // Update search results to show request sent
        setSearchResults(prev => 
          prev.map(user => 
            user.user_id === userId 
              ? { ...user, request_sent: true }
              : user
          )
        )
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send connection request",
        variant: "destructive",
      })
    }
  }

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/user-connections/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ response: action === "accept" ? "accepted" : "rejected" }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Connection request ${action}ed successfully`,
        })
        fetchConnectionRequests()
        if (action === "accept") {
          fetchConnections()
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error responding to request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to respond to request",
        variant: "destructive",
      })
    }
  }

  const removeConnection = async (connectionId) => {
    try {
      const response = await fetch(`/api/user-connections/${connectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Connection removed successfully",
        })
        fetchConnections()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error removing connection:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove connection",
        variant: "destructive",
      })
    }
  }

  const removeConnectionByUserId = async (userId) => {
    try {
      // First find the connection ID
      const connection = connections.find(conn => 
        conn.friend_info.id === userId
      )
      
      if (connection) {
        await removeConnection(connection.id)
        // Refresh search results to update button state
        if (searchQuery) {
          searchUsers(searchQuery)
        }
      }
    } catch (error) {
      console.error("Error removing connection by user ID:", error)
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      })
    }
  }

  const cancelConnectionRequest = async (userId) => {
    try {
      // Find the sent request
      const request = sentRequests.find(req => req.other_user_id === userId)
      
      if (request) {
        const response = await fetch(`/api/user-connections/${request.id}`, {
          method: "DELETE",
        })

        const data = await response.json()
        if (data.success) {
          toast({
            title: "Success",
            description: "Connection request cancelled",
          })
          fetchConnectionRequests()
          // Refresh search results to update button state
          if (searchQuery) {
            searchUsers(searchQuery)
          }
        } else {
          throw new Error(data.message)
        }
      }
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive",
      })
    }
  }

  const respondToRequestByUserId = async (userId, action) => {
    try {
      // Find the pending request from this user
      const request = pendingRequests.find(req => req.other_user_id === userId)
      
      if (request) {
        await respondToRequest(request.id, action)
        // Refresh search results to update button state
        if (searchQuery) {
          searchUsers(searchQuery)
        }
      }
    } catch (error) {
      console.error("Error responding to request by user ID:", error)
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive",
      })
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchUsers(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network</h1>
          <p className="text-muted-foreground">
            Manage your connections and discover new farmers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <FiUsers className="h-8 w-8 text-primary" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections">
            My Network ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>
                Farmers and agricultural professionals in your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No connections yet</h3>
                  <p className="text-muted-foreground">
                    Start building your network by discovering and connecting with other farmers
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connections.map((connection) => (
                    <Card key={connection.connection_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={connection.friend_info.profile_pic} alt={connection.friend_info.name} />
                            <AvatarFallback>
                              {connection.friend_info.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => router.push(`/profile/${connection.friend_info.id}`)}
                            >
                              {connection.friend_info.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {connection.friend_info.phone || 'No phone provided'}
                            </p>
                            {(connection.friend_info.area || connection.friend_info.city) && (
                              <p className="text-xs text-muted-foreground">
                                📍 {[connection.friend_info.area, connection.friend_info.city, connection.friend_info.country].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.push(`/messages?user=${connection.friend_info.id}`)}
                          >
                            Message
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => router.push(`/profile/${connection.friend_info.id}`)}
                          >
                            View Profile
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => removeConnection(connection.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Connection requests waiting for your response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <FiUserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending requests</h3>
                  <p className="text-muted-foreground">
                    You'll see connection requests from other farmers here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.other_user_profile_pic} alt={request.other_user_name} />
                              <AvatarFallback>
                                {request.other_user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 
                                className="font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => router.push(`/profile/${request.other_user_id}`)}
                              >
                                {request.other_user_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">{request.other_user_area || 'No area specified'}</p>
                              <p className="text-xs text-muted-foreground">
                                Sent {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => respondToRequest(request.id, "accept")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <FiCheck className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => respondToRequest(request.id, "reject")}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <FiX className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
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

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>
                Connection requests you've sent to other farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <FiUserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No sent requests</h3>
                  <p className="text-muted-foreground">
                    Requests you send will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.other_user_profile_pic} alt={request.other_user_name} />
                              <AvatarFallback>
                                {request.other_user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 
                                className="font-medium cursor-pointer hover:text-primary transition-colors"
                                onClick={() => router.push(`/profile/${request.other_user_id}`)}
                              >
                                {request.other_user_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">{request.other_user_area || 'No area specified'}</p>
                              <p className="text-xs text-muted-foreground">
                                Sent {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Pending</Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cancelConnectionRequest(request.other_user_id)}
                            >
                              Cancel
                            </Button>
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

        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discover Farmers</CardTitle>
              <CardDescription>
                Find and connect with other farmers and agricultural professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or location..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>

                {isLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Searching...</p>
                  </div>
                )}

                {!isLoading && searchResults.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <FiSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No results found</h3>
                    <p className="text-muted-foreground">
                      Try searching with different keywords
                    </p>
                  </div>
                )}

                {!isLoading && searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-8">
                    <FiSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Search for farmers</h3>
                    <p className="text-muted-foreground">
                      Use the search bar above to find other farmers and agricultural professionals
                    </p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((user) => (
                      <Card key={user.user_id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.profile_image} alt={user.full_name} />
                              <AvatarFallback>
                                {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => router.push(`/profile/${user.user_id}`)}
                              >
                                {user.full_name}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>
                              {user.location && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {user.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            {user.is_connected ? (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="w-full"
                                onClick={() => {
                                  // Find the connection ID and remove it
                                  // We need to get the connection ID first
                                  removeConnectionByUserId(user.user_id)
                                }}
                              >
                                Remove Connection
                              </Button>
                            ) : user.request_sent ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full"
                                onClick={() => cancelConnectionRequest(user.user_id)}
                              >
                                Cancel Request
                              </Button>
                            ) : user.request_received ? (
                              <div className="space-y-2">
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => respondToRequestByUserId(user.user_id, "accept")}
                                >
                                  Accept Request
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => respondToRequestByUserId(user.user_id, "reject")}
                                >
                                  Decline Request
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => sendConnectionRequest(user.user_id)}
                              >
                                <FiUserPlus className="h-4 w-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
