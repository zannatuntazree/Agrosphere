import { userConnectionModel } from "../models/userConnectionModel.js"
import { userModel } from "../models/userModel.js"

export const userConnectionController = {
  // Find farmers by location search
  async findFarmersByLocation(userId, location, area = null) {
    try {
      let farmers = [];
      
      if (location || area) {
        farmers = await userConnectionModel.findFarmersByLocation(userId, location, area)
      } else {
        farmers = await userConnectionModel.getAllFarmers(userId)
      }

      return {
        success: true,
        farmers,
        message: "Farmers retrieved successfully"
      }
    } catch (error) {
      console.error("Find farmers by location error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Send connection request
  async sendConnectionRequest(requesterId, receiverId) {
    try {
      if (requesterId === receiverId) {
        throw new Error("Cannot send connection request to yourself")
      }

      // Check if receiver exists
      const receiver = await userModel.findUserById(receiverId)
      if (!receiver) {
        throw new Error("User not found")
      }

      const connectionRequest = await userConnectionModel.sendConnectionRequest(requesterId, receiverId)

      return {
        success: true,
        connectionRequest,
        message: "Connection request sent successfully"
      }
    } catch (error) {
      console.error("Send connection request error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Respond to connection request
  async respondToConnectionRequest(userId, connectionId, response) {
    try {
      const updatedConnection = await userConnectionModel.respondToConnectionRequest(
        connectionId, 
        userId, 
        response
      )

      return {
        success: true,
        connection: updatedConnection,
        message: `Connection request ${response} successfully`
      }
    } catch (error) {
      console.error("Respond to connection request error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's connection requests
  async getUserConnectionRequests(userId, type = 'all') {
    try {
      const requests = await userConnectionModel.getUserConnectionRequests(userId, type)

      return {
        success: true,
        requests,
        message: "Connection requests retrieved successfully"
      }
    } catch (error) {
      console.error("Get connection requests error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's connections (friends)
  async getUserConnections(userId) {
    try {
      const connections = await userConnectionModel.getUserConnections(userId)

      return {
        success: true,
        connections,
        message: "Connections retrieved successfully"
      }
    } catch (error) {
      console.error("Get connections error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

}
