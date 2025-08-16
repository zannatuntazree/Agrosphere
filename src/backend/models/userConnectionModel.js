import sql from "../config/database.js"

export const userConnectionModel = {
  // Find farmers by location search
  async findFarmersByLocation(userId, location, area = null, limit = 20) {
    let whereClause = sql`WHERE u.id != ${userId} AND u.is_banned = FALSE`
    
    if (location) {
      whereClause = sql`${whereClause} AND (
        u.city ILIKE ${'%' + location + '%'} OR 
        u.area ILIKE ${'%' + location + '%'} OR 
        u.country ILIKE ${'%' + location + '%'}
      )`
    }
    
    if (area) {
      whereClause = sql`${whereClause} AND u.area ILIKE ${'%' + area + '%'}`
    }

    const result = await sql`
      SELECT 
        u.id, u.name, u.profile_pic, u.area, u.city, u.country, u.phone,
        u.preferred_crops, u.created_at, u.age,
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE NULL
        END as connection_status,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          WHEN uc.receiver_id = ${userId} THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN user_connections uc ON 
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limit}
    `
    return result
  },

  // Get all farmers (for browsing without location filter)
  async getAllFarmers(userId, limit = 20, offset = 0) {
    const result = await sql`
      SELECT 
        u.id, u.name, u.profile_pic, u.area, u.city, u.country, u.phone,
        u.preferred_crops, u.created_at, u.age,
        CASE 
          WHEN uc.id IS NOT NULL THEN uc.status
          ELSE NULL
        END as connection_status,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          WHEN uc.receiver_id = ${userId} THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN user_connections uc ON 
        (uc.requester_id = ${userId} AND uc.receiver_id = u.id) OR
        (uc.receiver_id = ${userId} AND uc.requester_id = u.id)
      WHERE u.id != ${userId} AND u.is_banned = FALSE
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  },

  // Send connection request
  async sendConnectionRequest(requesterId, receiverId) {
    try {
      // Check if connection already exists
      const existingConnection = await sql`
        SELECT id, status FROM user_connections
        WHERE (requester_id = ${requesterId} AND receiver_id = ${receiverId})
           OR (requester_id = ${receiverId} AND receiver_id = ${requesterId})
      `

      if (existingConnection.length > 0) {
        throw new Error("Connection request already exists")
      }

      const result = await sql`
        INSERT INTO user_connections (requester_id, receiver_id, status)
        VALUES (${requesterId}, ${receiverId}, 'pending')
        RETURNING id, requester_id, receiver_id, status, created_at
      `
      return result[0]
    } catch (error) {
      throw error
    }
  },

  // Respond to connection request (accept/reject)
  async respondToConnectionRequest(connectionId, userId, response) {
    if (!['accepted', 'rejected'].includes(response)) {
      throw new Error("Invalid response. Must be 'accepted' or 'rejected'")
    }

    const result = await sql`
      UPDATE user_connections 
      SET status = ${response}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${connectionId} 
        AND receiver_id = ${userId}
        AND status = 'pending'
      RETURNING id, requester_id, receiver_id, status, updated_at
    `

    if (result.length === 0) {
      throw new Error("Connection request not found or unauthorized")
    }

    return result[0]
  },

  // Get user's connection requests
  async getUserConnectionRequests(userId, type = 'all') {
    let whereClause = sql``
    
    if (type === 'sent') {
      whereClause = sql`WHERE uc.requester_id = ${userId}`
    } else if (type === 'received') {
      whereClause = sql`WHERE uc.receiver_id = ${userId}`
    } else {
      whereClause = sql`WHERE uc.requester_id = ${userId} OR uc.receiver_id = ${userId}`
    }

    const result = await sql`
      SELECT 
        uc.id, uc.requester_id, uc.receiver_id, uc.status,
        uc.created_at, uc.updated_at,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.profile_pic
          ELSE u1.profile_pic
        END as other_user_profile_pic,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.area
          ELSE u1.area
        END as other_user_area,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN uc.requester_id = ${userId} THEN 'sent'
          ELSE 'received'
        END as request_direction
      FROM user_connections uc
      JOIN users u1 ON uc.requester_id = u1.id
      JOIN users u2 ON uc.receiver_id = u2.id
      ${whereClause}
      ORDER BY uc.created_at DESC
    `
    return result
  },

  // Get user's accepted connections (friends)
  async getUserConnections(userId) {
    const result = await sql`
      SELECT 
        uc.id as connection_id, uc.created_at as connected_since,
        CASE 
          WHEN uc.requester_id = ${userId} THEN u2.*
          ELSE u1.*
        END as friend_info
      FROM user_connections uc
      JOIN users u1 ON uc.requester_id = u1.id
      JOIN users u2 ON uc.receiver_id = u2.id
      WHERE (uc.requester_id = ${userId} OR uc.receiver_id = ${userId})
        AND uc.status = 'accepted'
      ORDER BY uc.created_at DESC
    `
    return result
  },

  // Get connection between two users
  async getConnectionBetweenUsers(userId1, userId2) {
    const result = await sql`
      SELECT * FROM user_connections
      WHERE (requester_id = ${userId1} AND receiver_id = ${userId2})
         OR (requester_id = ${userId2} AND receiver_id = ${userId1})
    `
    return result[0]
  }
}
