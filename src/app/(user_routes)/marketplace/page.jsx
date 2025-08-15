"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { FiClock, FiEdit, FiMail, FiMapPin, FiPhone, FiPlus, FiSearch, FiShoppingCart, FiTrash2, FiUser } from "react-icons/fi"

// Crop emojis for visual appeal
const cropEmojis = {
  "Rice": "🍚", "Wheat": "🌾", "Maize": "🌽", "Potato": "🥔", "Onion": "🧅",
  "Garlic": "🧄", "Chili": "🌶️", "Tomato": "🍅", "Vegetables": "🥬",
  "Fruits": "🍎", "Spices": "🌿", "default": "🌾"
}

const getCropEmoji = (cropName) => {
  return cropEmojis[cropName] || cropEmojis.default
}

// Units for dropdown
const units = ["kg", "ton", "quintal", "piece", "box", "bag"]

export default function MarketplacePage() {
  const [listings, setListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isMyListingsDialogOpen, setIsMyListingsDialogOpen] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    crop_name: "",
    description: "",
    price_per_unit: "",
    unit: "kg",
    quantity_available: "",
    location: "",
    contact_phone: "",
    contact_email: ""
  })

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append("crop_name", searchTerm)
      if (locationFilter) params.append("location", locationFilter)
      
      const response = await fetch(`/api/marketplace?${params}`, {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setListings(result.listings || [])
      } else {
        setError(result.message || "Failed to fetch marketplace listings")
      }
    } catch (error) {
      console.error("Error fetching listings:", error)
      setError("Network error occurred while fetching listings")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyListings = async () => {
    try {
      const response = await fetch("/api/marketplace/my-listings", {
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMyListings(result.listings || [])
      } else {
        console.error("Failed to fetch my listings:", result.message)
      }
    } catch (error) {
      console.error("Error fetching my listings:", error)
    }
  }

  const handleSearch = () => {
    setIsLoading(true)
    fetchListings()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const url = editingListing ? `/api/marketplace/${editingListing.id}` : "/api/marketplace"
      const method = editingListing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setFormData({
          crop_name: "",
          description: "",
          price_per_unit: "",
          unit: "kg",
          quantity_available: "",
          location: "",
          contact_phone: "",
          contact_email: ""
        })
        setIsCreateDialogOpen(false)
        setEditingListing(null)
        fetchListings()
        if (isMyListingsDialogOpen) {
          fetchMyListings()
        }
      } else {
        console.error("Failed to save listing:", result.message)
      }
    } catch (error) {
      console.error("Error saving listing:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (listing) => {
    setEditingListing(listing)
    setFormData({
      crop_name: listing.crop_name,
      description: listing.description || "",
      price_per_unit: listing.price_per_unit.toString(),
      unit: listing.unit,
      quantity_available: listing.quantity_available.toString(),
      location: listing.location || "",
      contact_phone: listing.contact_phone || "",
      contact_email: listing.contact_email || ""
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    try {
      const response = await fetch(`/api/marketplace/${listingId}`, {
        method: "DELETE",
        credentials: "include"
      })

      const result = await response.json()

      if (response.ok && result.success) {
        fetchListings()
        fetchMyListings()
      } else {
        console.error("Failed to delete listing:", result.message)
      }
    } catch (error) {
      console.error("Error deleting listing:", error)
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-9 w-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Buy and sell agricultural products</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isMyListingsDialogOpen} onOpenChange={(open) => {
            setIsMyListingsDialogOpen(open)
            if (open) fetchMyListings()
          }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FiShoppingCart className="h-4 w-4" />
                My Listings
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>My Marketplace Listings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {myListings.length === 0 ? (
                  <div className="text-center py-8">
                    <FiShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No listings yet</p>
                  </div>
                ) : (
                  myListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getCropEmoji(listing.crop_name)}</span>
                          <h3 className="font-semibold">{listing.crop_name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            listing.status === 'active' ? 'bg-green-100 text-green-800' :
                            listing.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-green-600">৳{listing.price_per_unit}/{listing.unit}</p>
                        <p className="text-sm text-gray-600">Quantity: {listing.quantity_available} {listing.unit}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(listing)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) {
              setEditingListing(null)
              setFormData({
                crop_name: "",
                description: "",
                price_per_unit: "",
                unit: "kg",
                quantity_available: "",
                location: "",
                contact_phone: "",
                contact_email: ""
              })
            }
          }}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <FiPlus className="h-4 w-4" />
                Create Listing
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingListing ? "Edit Listing" : "Create New Listing"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Crop Name *</label>
                  <input
                    type="text"
                    value={formData.crop_name}
                    onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price per Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity Available *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({...formData, quantity_available: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Saving..." : editingListing ? "Update Listing" : "Create Listing"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="relative">
          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{getCropEmoji(listing.crop_name)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {listing.crop_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiUser className="h-4 w-4" />
                    <span>{listing.seller_name}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>
              )}

              {/* Price and Quantity */}
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  ৳{listing.price_per_unit}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    /{listing.unit}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available: {listing.quantity_available} {listing.unit}
                </p>
              </div>

              {/* Location */}
              {listing.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <FiMapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {listing.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiPhone className="h-4 w-4 text-green-600" />
                    <a href={`tel:${listing.contact_phone}`} className="text-green-600 hover:underline">
                      {listing.contact_phone}
                    </a>
                  </div>
                )}
                {listing.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <FiMail className="h-4 w-4 text-blue-600" />
                    <a href={`mailto:${listing.contact_email}`} className="text-blue-600 hover:underline">
                      {listing.contact_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <FiClock className="h-3 w-3" />
                  <span>{formatTimeAgo(listing.created_at)}</span>
                </div>
                {listing.seller_area && (
                  <span>{listing.seller_area}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!isLoading && listings.length === 0 && !error && (
        <div className="text-center py-12">
          <FiShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No listings found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || locationFilter 
              ? "Try adjusting your search criteria"
              : "Be the first to list your crops for sale"
            }
          </p>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create First Listing
          </button>
        </div>
      )}
    </div>
  )
}
