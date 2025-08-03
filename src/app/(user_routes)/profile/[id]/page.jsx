"use client"
import { useState, useEffect, useRef } from "react"
import { FiEdit, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiCamera, FiLoader } from "react-icons/fi"

// Card Components
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}
  >
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>

const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>
)

// Button Component
const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  disabled = false,
  type = "button",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-900 hover:bg-gray-200",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    icon: "h-10 w-10",
  }

  return (
    <button
      // @ts-ignore
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// Avatar Component
const Avatar = ({ children, className = "" }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
)

const AvatarImage = ({ src, alt }) =>
  src ? <img className="aspect-square h-full w-full" src={src || "/placeholder.svg"} alt={alt} /> : null

const AvatarFallback = ({ children, className = "" }) => (
  <div
    className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 ${className}`}
  >
    {children}
  </div>
)

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-800",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

// Input Components
const Input = ({ id, name, value, onChange, type = "text", required = false, placeholder = "", className = "" }) => (
  <input
    id={id}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
)

const Textarea = ({ id, name, value, onChange, rows = 3, placeholder = "", className = "" }) => (
  <textarea
    id={id}
    name={name}
    rows={rows}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
)

const Label = ({ htmlFor, children, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
)

// Dialog Components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">{children}</div>
      </div>
    </div>
  )
}

const DialogContent = ({ children, className = "" }) => (
  <div className={`max-h-[90vh] overflow-y-auto dark:text-gray-100 ${className}`}>{children}</div>
)

const DialogHeader = ({ children }) => <div className="p-6 pb-4">{children}</div>

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold leading-none tracking-tight dark:text-gray-100">{children}</h2>
)

const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{children}</p>
)

const DialogFooter = ({ children }) => <div className="flex justify-end gap-2 p-6 pt-0">{children}</div>

// Edit Profile Dialog Component
const EditProfileDialog = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    age: "",
    preferred_crops: "",
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        age: user.age ? user.age.toString() : "",
        preferred_crops: user.preferred_crops ? user.preferred_crops.join(", ") : "",
      })
      setImagePreview(user.profile_pic || "")
      setSelectedImage(null)
    }
  }, [user, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        // @ts-ignore
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Upload image if selected
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append("image", selectedImage)

        const imageResponse = await fetch("/api/user/upload-image", {
          method: "POST",
          body: imageFormData,
          credentials: "include",
        })

        if (!imageResponse.ok) {
          throw new Error("Failed to upload image")
        }
      }

      // Update profile data
      const profileData = {
        ...formData,
        age: formData.age ? Number.parseInt(formData.age) : null,
        preferred_crops: formData.preferred_crops
          ? formData.preferred_crops
              .split(",")
              .map((crop) => crop.trim())
              .filter(Boolean)
          : [],
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const result = await response.json()
      if (result.success) {
        onProfileUpdate(result.user)
        onClose()
      } else {
        throw new Error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedImage(null)
    setImagePreview(user?.profile_pic || "")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and profile picture.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-0">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Profile" />
                <AvatarFallback className="text-lg">{formData.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiCamera className="h-4 w-4" />
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleInputChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="preferred_crops">Preferred Crops</Label>
              <Input
                id="preferred_crops"
                name="preferred_crops"
                value={formData.preferred_crops}
                onChange={handleInputChange}
                placeholder="e.g., Rice, Wheat, Corn (comma separated)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" className="dark:text-black" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Profile Page Component
export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUser(result.user)
        } else {
          console.error("Failed to fetch profile:", result.message)
        }
      } else {
        console.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
    // Update localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const handleEditClick = () => {
    console.log("Edit button clicked") // Debug log
    setIsEditDialogOpen(true)
  }

  const handleDialogClose = () => {
    console.log("Dialog closing") // Debug log
    setIsEditDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your profile information and preferences</p>
        </div>
        <Button onClick={handleEditClick}>
          <FiEdit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profile_pic || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <FiMail className="h-4 w-4" />
              {user.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <FiPhone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.age && (
              <div className="flex items-center gap-2 text-sm">
                <FiUser className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>{user.age} years old</span>
              </div>
            )}
            {(user.city || user.country) && (
              <div className="flex items-center gap-2 text-sm">
                <FiMapPin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span>{[user.city, user.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.address && (
              <div>
                <h3 className="font-medium mb-2">Address</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.address}</p>
              </div>
            )}

            {user.preferred_crops && user.preferred_crops.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Preferred Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {user.preferred_crops.map((crop, index) => (
                    <Badge key={index} variant="secondary">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!user.phone && !user.address && !user.preferred_crops?.length && (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Complete your profile to get personalized recommendations
                </p>
                <Button variant="outline" onClick={handleEditClick}>
                  <FiEdit className="mr-2 h-4 w-4" />
                  Add Information
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      {user && (
        <EditProfileDialog
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          user={user}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}
