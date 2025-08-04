# 🌾 Agriculture App - Data Flow Explanation

This document explains how data flows from frontend to backend and back in our agriculture application.

## 📊 Data Flow Architecture

```
Frontend (React) → API Route → Controller → Model → Database
                ←            ←            ←       ←
```

## 🔄 Complete Flow Examples

### 1. 💰 Expenses Flow

#### Frontend Request (Create Expense)
```javascript
// app/(user_routes)/expense-tracker/page.jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'expense',
      category: 'Seeds',
      amount: 500,
      description: 'Rice seeds',
      date: '2024-01-15'
    }),
    credentials: 'include'
  })
  
  if (response.ok) {
    const result = await response.json()
    if (result.success) {
      fetchExpenses() // Refresh the list
      setIsDialogOpen(false)
    }
  }
}
```

#### API Route Handler
```javascript
// app/api/expenses/route.js
export async function POST(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const result = await expenseController.createExpenseEarning(authToken, body)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
```

#### Controller Logic
```javascript
// backend/controllers/expenseController.js
async createExpenseEarning(userId, data) {
  const { type, category, amount, description, date } = data
  
  // Validate required fields
  if (!type || !category || !amount) {
    throw new Error("Type, category, and amount are required")
  }
  
  // Call model to create expense
  const expense = await expenseModel.createExpenseEarning({
    user_id: userId,
    type,
    category,
    amount: parseFloat(amount),
    description,
    date: date || new Date().toISOString().split('T')[0]
  })
  
  return {
    success: true,
    data: expense,
    message: "Expense created successfully"
  }
}
```

#### Model Database Query
```javascript
// backend/models/expenseModel.js
async createExpenseEarning(data) {
  const { user_id, type, category, amount, description, date } = data
  
  const result = await sql`
    INSERT INTO expenses_earnings (user_id, type, category, amount, description, date)
    VALUES (${user_id}, ${type}, ${category}, ${amount}, ${description}, ${date})
    RETURNING id, user_id, type, category, amount, description, date, created_at
  `
  
  return result[0]
}
```

#### Frontend Display (How Data is Shown)
```javascript
// app/(user_routes)/expense-tracker/page.jsx
// After successful creation, data is displayed in the UI:

return (
  <div className="space-y-4">
    {expenses.map((expense) => (
      <div key={expense.id} className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{expense.category}</h3>
            <p className="text-sm text-gray-600">{expense.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${
              expense.type === 'earning' ? 'text-green-600' : 'text-red-600'
            }`}>
              {expense.type === 'earning' ? '+' : '-'}${expense.amount}
            </p>
            <span className={`px-2 py-1 text-xs rounded-full ${
              expense.type === 'earning' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {expense.type}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)
```

**How it works:**
1. User fills expense form and submits
2. Frontend sends POST request with expense data
3. API route extracts user ID from cookie and calls controller
4. Controller validates data and calls model
5. Model executes SQL INSERT query
6. Database returns new expense record
7. Response flows back through controller → API → frontend
8. **Frontend displays** the new expense in a card with category, amount, date, and type styling

---

### 2. 🌾 Lands Flow

#### Frontend Request (Get User Lands)
```javascript
// app/(user_routes)/lands/page.jsx
const [lands, setLands] = useState([])
const [stats, setStats] = useState([])

useEffect(() => {
  const fetchLands = async () => {
    try {
      const response = await fetch('/api/lands', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLands(result.lands)
          setStats(result.stats)
        }
      }
    } catch (error) {
      console.error('Error fetching lands:', error)
    }
  }
  
  fetchLands()
}, [])
```

#### API Route Handler
```javascript
// app/api/lands/route.js
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const result = await landController.getUserLands(authToken)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
```

#### Controller Logic
```javascript
// backend/controllers/landController.js
async getUserLands(userId) {
  try {
    const lands = await landModel.getUserLands(userId)
    const stats = await landModel.getLandStats(userId)
    
    return {
      success: true,
      lands,
      stats,
      message: "Lands retrieved successfully"
    }
  } catch (error) {
    throw new Error(`Failed to get user lands: ${error.message}`)
  }
}
```

#### Model Database Query
```javascript
// backend/models/landModel.js
async getUserLands(userId) {
  const result = await sql`
    SELECT id, user_id, land_type, area, soil_quality, location_link, 
           description, tags, land_image, created_at, updated_at
    FROM lands 
    WHERE user_id = ${userId} AND deleted_at IS NULL 
    ORDER BY created_at DESC
  `
  return result
}

async getLandStats(userId) {
  const result = await sql`
    SELECT 
      land_type,
      COUNT(*) as count,
      SUM(area) as total_area
    FROM lands 
    WHERE user_id = ${userId} AND deleted_at IS NULL
    GROUP BY land_type
  `
  return result
}
```

#### Frontend Display (How Data is Shown)
```javascript
// app/(user_routes)/lands/page.jsx
// Data is displayed in a grid of land cards:

return (
  <div className="max-w-[80vw] mx-auto space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FiMap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalLands}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FiTrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalArea.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Total Area (acres)</p>
          </div>
        </div>
      </div>
    </div>

    {/* Lands Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lands.map((land) => (
        <div key={land.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg">
          {/* Land Image */}
          <div className="relative h-48 bg-gray-100">
            {land.land_image ? (
              <img
                src={land.land_image || "/placeholder.svg"}
                alt={`${land.land_type} land`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiMap className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Land Details */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{land.land_type}</h3>
              <span className="text-sm font-medium text-green-600">
                {land.area} acres
              </span>
            </div>
            
            {land.description && (
              <p className="text-sm text-gray-600 mb-3">{land.description}</p>
            )}
            
            {land.soil_quality && (
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="text-gray-500">Soil:</span>
                <span className="text-gray-900">{land.soil_quality}</span>
              </div>
            )}
            
            {/* Tags */}
            {land.tags && land.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {land.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <Link
              href={`/lands/${land.id}`}
              className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
)
```

**How it works:**
1. Component mounts and triggers useEffect
2. Frontend sends GET request to fetch lands
3. API route gets user ID from cookie
4. Controller calls model to get lands and stats
5. Model executes SQL SELECT queries
6. Database returns user's lands and statistics
7. Data flows back and updates React state
8. **Frontend displays** lands in a responsive grid with images, details, stats cards, and interactive elements

---

### 3. 🔔 Notifications Flow

#### Frontend Request (Get Notifications)
```javascript
// components/top-navbar.jsx
const [notifications, setNotifications] = useState([])
const [unreadCount, setUnreadCount] = useState(0)

const fetchNotifications = async () => {
  try {
    const response = await fetch('/api/notifications', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        setNotifications(result.notifications)
        const unread = result.notifications.filter(n => !n.is_read).length
        setUnreadCount(unread)
      }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

useEffect(() => {
  fetchNotifications()
  // Poll for new notifications every 30 seconds
  const interval = setInterval(fetchNotifications, 30000)
  return () => clearInterval(interval)
}, [])
```

#### API Route Handler
```javascript
// app/api/notifications/route.js
export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const result = await notificationController.getUserNotifications(authToken)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
```

#### Controller Logic
```javascript
// backend/controllers/notificationController.js
async getUserNotifications(userId) {
  try {
    // Clean up old notifications (older than 30 days)
    await notificationModel.deleteOldNotifications()
    
    // Get user notifications
    const notifications = await notificationModel.getUserNotifications(userId)
    
    return {
      success: true,
      notifications,
      message: "Notifications retrieved successfully"
    }
  } catch (error) {
    throw new Error(`Failed to get notifications: ${error.message}`)
  }
}
```

#### Model Database Query
```javascript
// backend/models/notificationModel.js
async getUserNotifications(userId) {
  const result = await sql`
    SELECT id, user_id, type, message, is_read, created_at
    FROM notifications 
    WHERE user_id = ${userId} 
      AND created_at >= NOW() - INTERVAL '30 days'
    ORDER BY created_at DESC
    LIMIT 50
  `
  return result
}

async deleteOldNotifications() {
  await sql`
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days'
  `
}
```

#### Frontend Display (How Data is Shown)
```javascript
// components/top-navbar.jsx
// Notifications are shown in a dropdown menu:

return (
  <div className="relative">
    {/* Notification Bell Icon */}
    <button
      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
    >
      <FiBell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>

    {/* Notification Dropdown */}
    {isNotificationOpen && (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FiBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getNotificationEmoji(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
)
```

**How it works:**
1. Navbar component fetches notifications on mount and every 30 seconds
2. API route authenticates user via cookie
3. Controller cleans old notifications then gets current ones
4. Model queries database for last 30 days notifications
5. Data flows back with notification list
6. **Frontend displays** notifications in a dropdown with:
   - Bell icon with unread count badge
   - Dropdown list with emoji, message, timestamp
   - Visual indicators for unread notifications
   - Mark as read functionality

---

### 4. 👤 Profile Flow

#### Frontend Request (Update Profile)
```javascript
// components/edit-profile-dialog.jsx
const [formData, setFormData] = useState({
  name: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  age: '',
  preferred_crops: ''
})

const handleSubmit = async () => {
  setIsLoading(true)
  
  try {
    // Upload image if selected
    if (selectedImage) {
      const imageFormData = new FormData()
      imageFormData.append('image', selectedImage)
      
      await fetch('/api/user/upload-image', {
        method: 'POST',
        body: imageFormData,
        credentials: 'include'
      })
    }
    
    // Update profile data
    const profileData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
      preferred_crops: formData.preferred_crops
        ? formData.preferred_crops.split(',').map(crop => crop.trim()).filter(Boolean)
        : []
    }
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        onProfileUpdate(result.user)
        onClose()
      }
    }
  } catch (error) {
    console.error('Error updating profile:', error)
  } finally {
    setIsLoading(false)
  }
}
```

#### API Route Handler
```javascript
// app/api/user/profile/route.js
export async function PUT(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const result = await userController.updateUserProfile(authToken, body)
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    
    const result = await userController.getUserProfile(authToken)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
```

#### Controller Logic
```javascript
// backend/controllers/userController.js
async updateUserProfile(userId, userData) {
  try {
    const updatedUser = await userModel.updateUser(userId, userData)
    
    // Get land stats for the user
    const landStats = await landModel.getLandStatsForUser(userId)
    updatedUser.landStats = landStats
    
    return {
      success: true,
      user: updatedUser,
      message: "Profile updated successfully"
    }
  } catch (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

async getUserProfile(userId) {
  try {
    const user = await userModel.getUserById(userId)
    if (!user) {
      throw new Error("User not found")
    }
    
    // Get land stats
    const landStats = await landModel.getLandStatsForUser(userId)
    user.landStats = landStats
    
    return {
      success: true,
      user,
      message: "Profile retrieved successfully"
    }
  } catch (error) {
    throw new Error(`Failed to get profile: ${error.message}`)
  }
}
```

#### Model Database Query
```javascript
// backend/models/userModel.js
async updateUser(id, userData) {
  const { name, phone, address, city, country, age, preferred_crops } = userData
  
  const result = await sql`
    UPDATE users 
    SET name = ${name}, 
        phone = ${phone}, 
        address = ${address}, 
        city = ${city}, 
        country = ${country}, 
        age = ${age}, 
        preferred_crops = ${preferred_crops}, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, name, email, phone, address, city, country, profile_pic, age, preferred_crops, created_at, updated_at
  `
  
  return result[0]
}

async getUserById(id) {
  const result = await sql`
    SELECT id, name, email, phone, address, city, country, profile_pic, age, preferred_crops, created_at, updated_at
    FROM users 
    WHERE id = ${id}
  `
  
  return result[0]
}
```

#### Frontend Display (How Data is Shown)
```javascript
// app/(user_routes)/profile/[id]/page.jsx
// Profile data is displayed in a comprehensive layout:

return (
  <div className="max-w-[80vw] mx-auto space-y-6">
    {/* Profile Header with Gradient Background */}
    <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-lg p-8 text-white">
      <div className="flex items-center gap-6">
        <div className="relative">
          <img
            src={profile.profile_pic || "/placeholder.svg?height=120&width=120"}
            alt={profile.name}
            className="w-24 h-24 rounded-full border-4 border-white/20 object-cover"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-green-100">
            {profile.email && (
              <div className="flex items-center gap-2">
                <FiMail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2">
                <FiPhone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4" />
                <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3 text-green-100">
            <FiCalendar className="h-4 w-4" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Land Statistics in one row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FiMap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {profile.landStats?.totalLands || 0}
            </p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FiTrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {profile.landStats?.totalArea || 0}
            </p>
            <p className="text-sm text-gray-600">Total Area (acres)</p>
          </div>
        </div>
      </div>
    </div>

    {/* Personal Information Card */}
    <div className="bg-white rounded-lg p-6 border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {profile.phone && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPhone className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{profile.phone}</p>
            </div>
          </div>
        )}

        {profile.age && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUser className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{profile.age} years old</p>
            </div>
          </div>
        )}
      </div>

      {profile.address && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <p className="text-sm text-gray-600 mb-2">Address</p>
          <p className="text-gray-900">{profile.address}</p>
        </div>
      )}

      {profile.preferred_crops && profile.preferred_crops.length > 0 && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <p className="text-sm text-gray-600 mb-3">Preferred Crops</p>
          <div className="flex flex-wrap gap-2">
            {profile.preferred_crops.map((crop, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)
```

**How it works:**
1. User edits profile in dialog form with image upload
2. Form submits PUT request with updated data
3. API route extracts user ID and calls controller
4. Controller calls model to update user data and get land stats
5. Model executes SQL UPDATE query
6. Updated user data returns through the chain
7. **Frontend displays** updated profile with:
   - Gradient header with profile picture and basic info
   - Land statistics cards showing total properties and area
   - Detailed personal information with icons
   - Preferred crops as styled badges
   - Responsive layout with proper spacing

---

## 🔐 Authentication Flow

### Cookie-Based Authentication
```javascript
// Every protected API route uses this pattern:
const authToken = request.cookies.get("auth-token")?.value

if (!authToken) {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
}

// authToken contains the user ID directly
const result = await controller.someMethod(authToken, data)
```

### Login Process
```javascript
// app/api/auth/login/route.js
export async function POST(request) {
  const { email, password } = await request.json()
  
  const result = await authController.loginUser(email, password)
  
  if (result.success) {
    const response = NextResponse.json(result, { status: 200 })
    
    // Set HTTP-only cookie with user ID
    response.cookies.set("auth-token", result.user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response
  }
}
```

### Logout Process
```javascript
// app/api/auth/logout/route.js
export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })
  
  // Delete the auth-token cookie
  response.cookies.delete("auth-token")
  
  return response
}
```

**How Authentication Works:**
1. **Login**: User credentials verified, cookie set with user ID
2. **Protected Routes**: Extract user ID from cookie for data access
3. **Data Isolation**: All queries filter by user ID to ensure privacy
4. **Logout**: Cookie deleted, user session ended

---

## 🗄️ Database Layer

### Neon PostgreSQL Connection
```javascript
// backend/config/database.js
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)
export default sql
```

### Query Patterns
```javascript
// Create
const result = await sql`
  INSERT INTO table (user_id, column1, column2) 
  VALUES (${userId}, ${value1}, ${value2}) 
  RETURNING *
`

// Read with user isolation
const result = await sql`
  SELECT * FROM table 
  WHERE user_id = ${userId} AND deleted_at IS NULL
  ORDER BY created_at DESC
`

// Update
const result = await sql`
  UPDATE table 
  SET column1 = ${value1}, updated_at = CURRENT_TIMESTAMP 
  WHERE id = ${id} AND user_id = ${userId}
  RETURNING *
`

// Soft Delete
const result = await sql`
  UPDATE table 
  SET deleted_at = CURRENT_TIMESTAMP 
  WHERE id = ${id} AND user_id = ${userId}
`
```

---

## 🚀 Key Features

### Error Handling
- **Frontend**: Try-catch blocks with user-friendly error messages
- **API Routes**: Consistent error response format with proper HTTP status codes
- **Controllers**: Business logic validation and error propagation
- **Models**: Database constraint handling and query error management

### Data Validation
- **Frontend**: Form validation before submission (required fields, data types)
- **Controllers**: Server-side validation for security and data integrity
- **Database**: Constraints, foreign keys, and data type enforcement

### Performance Optimizations
- **Frontend**: React state management, useEffect cleanup, conditional rendering
- **Backend**: Database indexing, query optimization, data pagination
- **Caching**: Automatic cleanup of old notifications, efficient data fetching

### Security Features
- **Authentication**: HTTP-only cookies prevent XSS attacks
- **Authorization**: User ID validation on every protected route
- **Data Isolation**: All queries filtered by user ID
- **Input Sanitization**: Parameterized queries prevent SQL injection

This architecture ensures clean separation of concerns, maintainable code, secure data handling, and excellent user experience throughout the application.
