// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FiPlus, FiEdit, FiMapPin, FiCamera, FiTag, FiTrendingUp, FiMap, FiX, FiLoader, FiTrash2 } from "react-icons/fi"

//land Types
const landTypes = [
  "Ucha Jomi",       
  "Moddhom Jomi",    
  "Nicher Jomi",     
  "Ati Nicher Jomi", 
  "Char",            
  "Haor",            
  "Upokulio Jomi",        
 "Charonabhumi" ,
  "Others",          
]; 

// Soil quality options
const soilQualities = [  "Dona Mati",
  "Balu Mati",
  "Doash Mati",
  "Kalo Mati",
  "Lal Mati",
  "Pank Mati",
  "Lona Mati",
  "Teep Mati",
  "others"
];

export default function LandsPage() {
  const [lands, setLands] = useState([])
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLand, setEditingLand] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    land_type: "",
    area: "",
    soil_quality: "",
    location_link: "",
    description: "",
    tags: "",
  })

  useEffect(() => {
    fetchLands()
  }, [])

  const fetchLands = async () => {
    try {
      const response = await fetch("/api/lands", {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLands(result.lands)
          setStats(result.stats)
        }
      }
    } catch (error) {
      console.error("Error fetching lands:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingLand ? `/api/lands/${editingLand.id}` : "/api/lands"
      const method = editingLand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Upload image if selected
          if (selectedImage && result.land) {
            await uploadImage(result.land.id)
          }

          setIsDialogOpen(false)
          resetForm()
          fetchLands()
        }
      }
    } catch (error) {
      console.error("Error saving land:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadImage = async (landId) => {
    if (!selectedImage) return

    const imageFormData = new FormData()
    imageFormData.append("image", selectedImage)
    imageFormData.append("landId", landId)

    try {
      await fetch("/api/lands/upload-image", {
        method: "POST",
        body: imageFormData,
        credentials: "include",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const handleEdit = (land) => {
    setEditingLand(land)
    setFormData({
      land_type: land.land_type,
      area: land.area.toString(),
      soil_quality: land.soil_quality || "",
      location_link: land.location_link || "",
      description: land.description || "",
      tags: land.tags ? land.tags.join(", ") : "",
    })
    setImagePreview(land.land_image || "")
    setSelectedImage(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this land?")) return

    try {
      const response = await fetch(`/api/lands/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchLands()
      }
    } catch (error) {
      console.error("Error deleting land:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      land_type: "",
      area: "",
      soil_quality: "",
      location_link: "",
      description: "",
      tags: "",
    })
    setEditingLand(null)
    setSelectedImage(null)
    setImagePreview("")
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const totalArea = stats.reduce((sum, stat) => sum + Number.parseFloat(stat.total_area || 0), 0)
  const totalLands = lands.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Lands</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track all your land properties in one place</p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus 
// @ts-ignore
          className="h-4 w-4" />
          Add Land
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiMap 
// @ts-ignore
              className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLands}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Properties</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiTrendingUp 
// @ts-ignore
              className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalArea.toFixed(1)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Area (acres)</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FiTag 
// @ts-ignore
              className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Land Types</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lands.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <FiMap 
// @ts-ignore
              className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No lands added yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start by adding your first property</p>
          </div>
        ) : (
          lands.map((land, index) => (
            <motion.div
              key={land.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                {land.land_image ? (
                  <img
                    src={land.land_image || "/placeholder.svg"}
                    alt={`${land.land_type} land`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiMap 
// @ts-ignore
                    className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Action buttons overlay */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(land)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Edit land"
                  >
                    <FiEdit 
// @ts-ignore
                    className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(land.id)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Delete land"
                  >
                    <FiTrash2 
// @ts-ignore
                    className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{land.land_type}</h3>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">{land.area} acres</span>
                </div>

                {land.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{land.description}</p>
                )}

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {land.soil_quality && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Soil:</span>
                      <span className="text-gray-900 dark:text-white">{land.soil_quality}</span>
                    </div>
                  )}

                  {land.location_link && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiMapPin 
// @ts-ignore
                      className="h-4 w-4 text-gray-400" />
                      <a
                        href={land.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Location
                      </a>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {land.tags && land.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {land.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {land.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                        +{land.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* View Details Button */}
                <Link
                  href={`/lands/${land.id}`}
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Land Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsDialogOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingLand ? "Edit Land" : "Add New Land"}
                  </h2>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <FiX 
// @ts-ignore
                    className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Land Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiCamera 
// @ts-ignore
                            className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Choose Image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Land Type *
                      </label>
                      <select
                        name="land_type"
                        value={formData.land_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Select land type</option>
                        {landTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Area (acres) *
                      </label>
                      <input
                        type="number"
                        name="area"
                        step="0.01"
                        min="0"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Soil Quality
                      </label>
                      <select
                        name="soil_quality"
                        value={formData.soil_quality}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select soil quality</option>
                        {soilQualities.map((quality) => (
                          <option key={quality} value={quality}>
                            {quality}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location Link
                      </label>
                      <input
                        type="url"
                        name="location_link"
                        value={formData.location_link}
                        onChange={handleInputChange}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Brief description of the land..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., fertile, irrigated, organic (comma separated)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">
                            <FiLoader size={16} color="currentColor" />
                          </span>
                          {editingLand ? "Updating..." : "Adding..."}
                        </>
                      ) : editingLand ? (
                        "Update Land"
                      ) : (
                        "Add Land"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
