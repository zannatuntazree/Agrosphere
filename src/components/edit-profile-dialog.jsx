"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FiCamera, FiLoader } from "react-icons/fi"

export default function EditProfileDialog({ isOpen, onClose, user, onProfileUpdate }) {
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

  // Initialize form data when user prop changes or dialog opens
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
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information and profile picture.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
