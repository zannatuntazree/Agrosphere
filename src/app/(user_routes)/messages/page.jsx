"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { getUserFromStorage } from "@/lib/auth"
import { FiMessageSquare, FiSend, FiSearch } from "react-icons/fi"

export default function MessagesPage() {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const userParam = searchParams.get("user")

  useEffect(() => {
    const user = getUserFromStorage()
    setCurrentUser(user)
    fetchConversations()

    // If user parameter is provided, start conversation with that user
    if (userParam) {
      startConversationWithUser(userParam)
    }
  }, [userParam])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversation_id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations")
      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async (conversationId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages/${conversationId}`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startConversationWithUser = async (userId) => {
    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: userId }),
      })

      const data = await response.json()
      if (data.success) {
        setSelectedConversation(data.conversation)
        // Refresh conversations list
        fetchConversations()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    const messageText = newMessage.trim()
    setNewMessage("") // Clear input immediately

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation.conversation_id,
          content: messageText,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Add the new message to the messages list
        setMessages(prev => [...prev, data.message])
        // Update conversation list to show latest message
        fetchConversations()
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setNewMessage(messageText) // Restore message on error
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (timestamp) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInDays = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return messageTime.toLocaleDateString([], { weekday: 'long' })
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="container mx-auto p-6 h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your network
          </p>
        </div>
        <FiMessageSquare className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Conversations List */}
        <Card className="lg:col-span-4 h-full">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              Your recent messages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {conversations.length === 0 ? (
                <div className="text-center p-6">
                  <FiMessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No conversations yet</h3>
                  <p className="text-muted-foreground">
                    Start messaging your connections from the Network page
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(
                      p => p.user_id !== currentUser?.id
                    )
                    const isSelected = selectedConversation?.conversation_id === conversation.conversation_id

                    return (
                      <div
                        key={conversation.conversation_id}
                        className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b ${
                          isSelected ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParticipant?.profile_image} />
                            <AvatarFallback>
                              {otherParticipant?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 
                                className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/profile/${otherParticipant?.user_id}`)
                                }}
                              >
                                {otherParticipant?.full_name}
                              </h4>
                              {conversation.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(conversation.last_message_at)}
                                </span>
                              )}
                            </div>
                            {conversation.last_message && (
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message}
                              </p>
                            )}
                          </div>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-8 h-full flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={
                      selectedConversation.participants.find(
                        p => p.user_id !== currentUser?.id
                      )?.profile_image
                    } />
                    <AvatarFallback>
                      {selectedConversation.participants.find(
                        p => p.user_id !== currentUser?.id
                      )?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 
                      className="font-medium cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        const otherUser = selectedConversation.participants.find(
                          p => p.user_id !== currentUser?.id
                        )
                        router.push(`/profile/${otherUser?.user_id}`)
                      }}
                    >
                      {selectedConversation.participants.find(
                        p => p.user_id !== currentUser?.id
                      )?.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.participants.find(
                        p => p.user_id !== currentUser?.id
                      )?.email}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-400px)] p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center h-full flex items-center justify-center">
                      <div>
                        <FiMessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Start the conversation</h3>
                        <p className="text-muted-foreground">
                          Send your first message below
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.sender_id === currentUser?.id
                        
                        return (
                          <div
                            key={message.message_id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-lg p-3 ${
                                  isOwnMessage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${
                                isOwnMessage ? 'text-right' : 'text-left'
                              }`}>
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || isSending}
                    size="icon"
                  >
                    <FiSend className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
