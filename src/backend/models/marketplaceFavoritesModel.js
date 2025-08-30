import sql from "../config/database.js"

export const marketplaceFavoritesModel = {
  // Add listing to favorites
  async addToFavorites(userId, listingId) {
    try {
      const result = await sql`
        INSERT INTO marketplace_favorites (user_id, listing_id, created_at)
        VALUES (${userId}, ${listingId}, NOW() AT TIME ZONE 'Asia/Dhaka')
        ON CONFLICT (user_id, listing_id) DO NOTHING
        RETURNING id, user_id, listing_id, created_at AT TIME ZONE 'Asia/Dhaka' as created_at
      `
      return result[0]
    } catch (error) {
      console.error("Error adding to favorites:", error)
      throw error
    }
  },

  // Remove listing from favorites
  async removeFromFavorites(userId, listingId) {
    try {
      const result = await sql`
        DELETE FROM marketplace_favorites 
        WHERE user_id = ${userId} AND listing_id = ${listingId}
        RETURNING id
      `
      return result[0]
    } catch (error) {
      console.error("Error removing from favorites:", error)
      throw error
    }
  },

  // Get user's favorite listings with full listing details
  async getUserFavorites(userId) {
    try {
      const result = await sql`
        SELECT 
          mf.id as favorite_id,
          mf.created_at AT TIME ZONE 'Asia/Dhaka' as favorited_at,
          ml.id, ml.user_id, ml.crop_name, ml.description, ml.price_per_unit,
          ml.unit, ml.quantity_available, ml.location, ml.contact_phone,
          ml.contact_email, ml.images, ml.status,
          ml.created_at AT TIME ZONE 'Asia/Dhaka' as created_at,
          ml.updated_at AT TIME ZONE 'Asia/Dhaka' as updated_at,
          u.name as seller_name, u.email as seller_email
        FROM marketplace_favorites mf
        JOIN marketplace_listings ml ON mf.listing_id = ml.id
        JOIN users u ON ml.user_id = u.id
        WHERE mf.user_id = ${userId}
        ORDER BY mf.created_at DESC
      `
      return result
    } catch (error) {
      console.error("Error fetching user favorites:", error)
      throw error
    }
  },

  // Check if a listing is favorited by user
  async isFavorited(userId, listingId) {
    try {
      const result = await sql`
        SELECT id FROM marketplace_favorites 
        WHERE user_id = ${userId} AND listing_id = ${listingId}
      `
      return result.length > 0
    } catch (error) {
      console.error("Error checking favorite status:", error)
      throw error
    }
  },

  // Get favorite count for a listing
  async getFavoriteCount(listingId) {
    try {
      const result = await sql`
        SELECT COUNT(*) as favorite_count
        FROM marketplace_favorites 
        WHERE listing_id = ${listingId}
      `
      return Number.parseInt(result[0]?.favorite_count || 0)
    } catch (error) {
      console.error("Error getting favorite count:", error)
      throw error
    }
  }
}