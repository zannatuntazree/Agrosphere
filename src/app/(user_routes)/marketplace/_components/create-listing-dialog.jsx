"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"

const units = ["kg", "ton", "quintal", "piece", "box", "bag"]

export default function CreateListingDialog({ open, onOpenChange, editingListing, onSave, cropEmojis }) {
  const cropOptions = Object.keys(cropEmojis).filter(crop => crop !== 'Other')

  const initialFormData = {
    crop_name: cropOptions[0], description: "", price_per_unit: "", unit: "kg",
    quantity_available: "", location: "", contact_phone: "", contact_email: ""
  }

  const [formData, setFormData] = useState(initialFormData)
  const [customCropName, setCustomCropName] = useState("")
  const [isOtherCrop, setIsOtherCrop] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    if (editingListing) {
      const isKnownCrop = cropOptions.includes(editingListing.crop_name)
      setIsOtherCrop(!isKnownCrop)
      setFormData({
        crop_name: isKnownCrop ? editingListing.crop_name : "Other",
        description: editingListing.description || "",
        price_per_unit: editingListing.price_per_unit.toString(),
        unit: editingListing.unit,
        quantity_available: editingListing.quantity_available.toString(),
        location: editingListing.location || "",
        contact_phone: editingListing.contact_phone || "",
        contact_email: editingListing.contact_email || ""
      })
      if (!isKnownCrop) setCustomCropName(editingListing.crop_name)
    } else {
      try {
        const userString = localStorage.getItem("user")
        const user = userString ? JSON.parse(userString) : null
        setFormData(prev => ({
          ...initialFormData,
          location: user?.area || "",
          contact_phone: user?.phone || "",
          contact_email: user?.email || ""
        }))
      } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        setFormData(initialFormData)
      }
    }
  }, [editingListing, open])

  const handleCropChange = (e) => {
    const value = e.target.value
    setIsOtherCrop(value === "Other")
    if (value !== "Other") setCustomCropName("")
    setFormData({ ...formData, crop_name: value })
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setFormData(initialFormData)
      setIsOtherCrop(false)
      setCustomCropName("")
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    if (isOtherCrop && !customCropName.trim()) {
      alert("Please specify the crop name.")
      return
    }

    setIsSubmitting(true)
    const finalData = { ...formData, crop_name: isOtherCrop ? customCropName : formData.crop_name }
    await onSave(finalData)
    setIsSubmitting(false)
  }

return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{editingListing ? "Edit Listing" : "Create New Listing"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Crop Name *</label>
                    <select value={formData.crop_name} onChange={handleCropChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required>
                        {cropOptions.map(crop => (
                            <option key={crop} value={crop}>
                                {cropEmojis[crop]} {crop}
                            </option>
                        ))}
                        <option value="Other">{cropEmojis["Other"]} Other</option>
                    </select>
                </div>
                {isOtherCrop && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Specify Crop Name *</label>
                        <input type="text" value={customCropName} onChange={(e) => setCustomCropName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Price per Unit *</label>
                        <input type="number" step="0.01" value={formData.price_per_unit} onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Unit *</label>
                        <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required>
                            {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Quantity Available *</label>
                    <input type="number" step="0.01" value={formData.quantity_available} onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-transparent" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? "Saving..." : editingListing ? "Update Listing" : "Create Listing"}
                </button>
            </form>
        </DialogContent>
    </Dialog>
)
}