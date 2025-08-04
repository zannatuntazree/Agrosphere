# Agrosphere API Documentation

Complete API documentation for testing with Postman.

## Base URL
```
http://localhost:3000   -> 3000 is the  port number
```

## To chage the port number 
just change the number after -p on ```package.json```
```
"scripts": {
    "dev": "next dev --turbopack -p 3000", }
```

## Authentication
Uses HTTP-only cookies. Login sets `auth-token` cookie with user ID, logout deletes it.

**Code Pattern:**
```bash 
javascript
const authToken = request.cookies.get("auth-token")?.value
// authToken = user's ID for database operations
```
## Dianamyic Route
```
Anything that has [id]  is dynamic route just use proper id 
```

---

## 🔐 Auth Endpoints

### In postman select ```raw``` and paste the body data like these .

### 1. Register
**POST** `/api/auth/register`

Body:
```bash
{
  "name": "Name",
  "email": "name@example.com", 
  "password": "password123"
}
```

Example Response:
```bash
{
  "success": true,
  "user": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User registered successfully"
}
```

### 2. Login
**POST** `/api/auth/login`

Body:
```bash
{
  "email": "name@example.com",
  "password": "password123"
}
```

Example Response (sets auth-token cookie):
```bash
{
  "success": true,
  "user": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "profile_pic": null
  },
  "message": "Login successful"
}
```

### 3. Logout
**POST** `/api/auth/logout`

Example Response (deletes auth-token cookie):
```bash
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 👤 User Profile

### 4. Get Profile
**GET** `/api/user/profile`

Example Response:
```bash
{
  "success": true,
  "user": {
    "id": "a1b2c3d4",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profile_pic": "https://res.cloudinary.com/...",
    "age": 35
  }
}
```

### 5. Update Profile
**PUT** `/api/user/profile`

Body:
```bash
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": "123 Farm Street",
  "age": 36
}
```

### 6. Upload Profile Picture
**POST** `/api/user/upload-image`

Form-data:
- Key: `image` (File)

Example Response:
```bash
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/...",
  "message": "Profile picture updated"
}
```

---

## 🔔 Notifications

### 7. Get Notifications
**GET** `/api/notifications`

Example Response:
```bash
{
  "success": true,
  "notifications": [
    {
      "id": "n1a2b3c4",
      "type": "welcome",
      "message": "Welcome to Agrosphere! 🌱",
      "is_read": false,
      "created_at": "2024-01-15T10:31:00.000Z"
    }
  ]
}
```

### 8. Create Notification (Only for Testing in the backend it is not used, creating notifiaction is directly used via function call )
**POST** `/api/notifications/create`

Body:
```bash
{
  "type": "farm_update",
  "message": "Your irrigation system activated"
}
```

Valid types: `welcome`, `forum`, `comment`, `farm_update`, `weather_alert`, `system`

### 9. Mark as Read
**PUT** `/api/notifications/mark-read`

Body:
```bash
{
  "notificationId": "n1a2b3c4"
}
```

### 10. Mark All Read
**PUT** `/api/notifications/mark-all-read`

### 11. Unread Count
**GET** `/api/notifications/unread-count`

Example Response:
```bash
{
  "success": true,
  "count": 5
}
```

---

## 💰 Expenses

### 12. Get Dashboard Data
**GET** `/api/expenses`

Example Response:
```bash
{
  "success": true,
  "data": {
    "currentMonth": {
      "totalExpenses": 1500.00,
      "totalEarnings": 2500.00,
      "netIncome": 1000.00
    },
    "yearlyData": [
      {
        "month": "January",
        "expenses": 1200.00,
        "earnings": 1800.00
      }
    ]
  }
} + more things
```

### 13. Create Expense/Earning
**POST** `/api/expenses`

Body:
```bash
{
  "type": "expense",
  "category": "seeds",
  "amount": 150.50,
  "description": "Wheat seeds",
  "date": "2024-01-15"
}
```

**Types:** `expense`, `earning`
**Expense Categories:** `seeds`, `fertilizer`, `equipment`, `labor`, `fuel`
**Earning Categories:** `crop_sales`, `livestock`, `dairy`, `rental`


### 14. Delete Expense
**DELETE** `/api/expenses/[id]`

### 15. Yearly Data
**GET** `/api/expenses/yearly/2024`

---

## 🌾 Lands

### 16. Get Lands
**GET** `/api/lands`

Example Response:
```bash
{
  "success": true,
  "lands": [
    {
      "id": "l1a2b3c4",
      "name": "North Field",
      "location": "Dhaka, Bangladesh",
      "area": 5.5,
      "land_type": "Ucha Jomi",
      "soil_quality": "Dona Mati",
      "current_crop": "Wheat",
      "image_url": "https://res.cloudinary.com/..."
    }
  ],
  "stats": {
    "totalLands": 3,
    "totalArea": 15.5
  }
}
```

### 17. Create Land
**POST** `/api/lands`

Body:
```bash
{
  "name": "South Field",
  "location": "Chittagong, Bangladesh",
  "area": 3.2,
  "land_type": "Moddhom Jomi",
  "soil_quality": "Balu Mati",
  "current_crop": "Rice"
}
```

**Land Types (Bengali):**
- `Ucha Jomi` (High Land)
- `Moddhom Jomi` (Medium Land)  
- `Nicu Jomi` (Low Land)
- `Pahari Jomi` (Hill Land)
- `Char Jomi` (River Island)

**Soil Quality (Bengali):**
- `Dona Mati` (Clay Soil)
- `Balu Mati` (Sandy Soil)
- `Dosh Mati` (Loamy Soil)
- `Kalo Mati` (Black Soil)
- `Lal Mati` (Red Soil)

### 20. Get Land
**GET** `/api/lands/[id]`

Example Response includes crop suggestions based on land type and soil quality.

### 21. Update Land
**PUT** `/api/lands/[id]`

### 22. Delete Land
**DELETE** `/api/lands/[id]`

### 23. Upload Land Image
**POST** `/api/lands/upload-image`

Form-data:
- Key: `image` (File)
- Key: `landId` (Text)

---

## 🧪 Testing Steps

1. **Register** → **Login** (sets cookie)
2. **Get Profile** (verify auth)
3. **Create Expense** → **Get Dashboard**
4. **Create Land** → **Upload Image**
5. **Logout** (deletes cookie)

## 🔧 Auth Pattern

All protected routes use:
```javascript
const authToken = request.cookies.get("auth-token")?.value
// authToken = user's ID
```

## 📝 Notes

- Cookie contains user ID (not JWT)
- All data filtered by user ID
- File uploads use form-data
- Bengali terms for land management
- Login sets cookie, logout deletes it


