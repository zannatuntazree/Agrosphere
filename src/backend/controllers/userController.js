import { userModel } from "../models/userModel.js"

export const userController = {
  async getUserProfile(userId) {
    try {
      const user = await userModel.findUserById(userId)
      if (!user) {
        throw new Error("User not found")
      }

      return {
        success: true,
        user,
        message: "User profile retrieved successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async updateUserProfile(userId, userData) {
    try {
      const updatedUser = await userModel.updateUser(userId, userData)
      if (!updatedUser) {
        throw new Error("User not found")
      }

      return {
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async updateProfilePicture(userId, profilePicUrl) {
    try {
      const updatedUser = await userModel.updateProfilePicture(userId, profilePicUrl)
      if (!updatedUser) {
        throw new Error("User not found")
      }

      return {
        success: true,
        user: updatedUser,
        message: "Profile picture updated successfully",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  },
}
