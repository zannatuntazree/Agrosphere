import { marketplaceFavoritesModel } from "../models/marketplaceFavoritesModel.js"

export const marketplaceFavoritesController = {
  // Add listing to favorites
  async addToFavorites(authToken, listingId) {
    try {
      const userId = authToken // auth token is just the user ID in this system
      
      if (!userId) {
        throw new Error("Invalid authentication token")
      }

      if (!listingId) {
        throw new Error("Listing ID is required")
      }

      const favorite = await marketplaceFavoritesModel.addToFavorites(userId, listingId)
      
      return {
        success: true,
        favorite,
        message: "Listing added to favorites successfully"
      }
    } catch (error) {
      console.error("Add to favorites error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Remove listing from favorites
  async removeFromFavorites(authToken, listingId) {
    try {
      const userId = authToken // auth token is just the user ID in this system
      
      if (!userId) {
        throw new Error("Invalid authentication token")
      }

      if (!listingId) {
        throw new Error("Listing ID is required")
      }

      const result = await marketplaceFavoritesModel.removeFromFavorites(userId, listingId)
      
      if (!result) {
        throw new Error("Favorite not found")
      }
      
      return {
        success: true,
        message: "Listing removed from favorites successfully"
      }
    } catch (error) {
      console.error("Remove from favorites error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Get user's favorites
  async getUserFavorites(authToken) {
    try {
      const userId = authToken // auth token is just the user ID in this system
      
      if (!userId) {
        throw new Error("Invalid authentication token")
      }

      const favorites = await marketplaceFavoritesModel.getUserFavorites(userId)
      
      return {
        success: true,
        favorites,
        message: "Favorites retrieved successfully"
      }
    } catch (error) {
      console.error("Get favorites error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  },

  // Check if listing is favorited
  async checkFavoriteStatus(authToken, listingId) {
    try {
      const userId = authToken // auth token is just the user ID in this system
      
      if (!userId) {
        return {
          success: true,
          isFavorited: false
        }
      }

      if (!listingId) {
        throw new Error("Listing ID is required")
      }

      const isFavorited = await marketplaceFavoritesModel.isFavorited(userId, listingId)
      
      return {
        success: true,
        isFavorited
      }
    } catch (error) {
      console.error("Check favorite status error:", error)
      return {
        success: false,
        message: error.message
      }
    }
  }
}