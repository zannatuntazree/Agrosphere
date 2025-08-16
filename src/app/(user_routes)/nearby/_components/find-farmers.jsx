import Image from "next/image"
import { MapPin, Users, UserPlus, Phone, Search, ChevronDown, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const FarmerCard = ({ farmer, sendRequest, navigateToProfile }) => {
  const getConnectionStatus = (user) => {
    if (user.connection_status === 'pending') {
      return user.request_direction === 'sent' ? 'Request Sent' : 'Request Received'
    }
    if (user.connection_status === 'accepted') {
      return 'Connected'
    }
    return null
  }

  const status = getConnectionStatus(farmer)

  return (
    <div className="dark:text-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="p-4 flex-grow">
        <div 
          className="flex items-start gap-4 cursor-pointer"
          onClick={() => navigateToProfile(farmer.id)}
        >
          <div className="relative h-14 w-14 flex-shrink-0">
            {farmer.profile_pic ? (
              <Image
                src={farmer.profile_pic}
                alt={farmer.name || 'Farmer'}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div 
                className="h-14 w-14 rounded-full flex items-center justify-center"
              >
                <User className="h-7 w-7 dark:text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate hover:text-green-600">
              {farmer.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
              <MapPin className="h-4 w-4" />
              {farmer.area && farmer.city ? `${farmer.area}, ${farmer.city}` : farmer.area || farmer.city || 'N/A'}
            </p>
            {farmer.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <Phone className="h-4 w-4" />
                {farmer.phone}
              </p>
            )}
          </div>
        </div>
        {farmer.preferred_crops && farmer.preferred_crops.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {farmer.preferred_crops.slice(0, 3).map((crop) => (
              <span key={crop} className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                {crop}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Button Area */}
      <div className="px-4 pb-4 mt-2 flex justify-end">
        {!status ? (
          <button
            onClick={() => sendRequest(farmer.id)}
            className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Connect
          </button>
        ) : (
          <div
            className={`text-center py-2 px-4 rounded-full font-semibold text-sm ${
              status === 'Connected'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
            }`}
          >
            
            {status}
          </div>
        )}
      </div>
    </div>
  )
}

const FarmerCardSkeleton = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col">
      <div className="p-4 flex-grow">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div className="px-4 pb-4 mt-2">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  )
}

const FindFarmersTab = ({
  farmers, isLoading, searchType, setSearchType, searchValue, setSearchValue, handleSearch, clearSearch, sendRequest, navigateToProfile, currentUser
}) => {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-[65%]">
          <div className="flex w-full items-center border border-gray-400 dark:border-gray-700 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500  transition-all">
            <div className="relative">
              <select 
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="h-full pl-4 pr-8 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 text-sm font-medium appearance-none focus:outline-none cursor-pointer"
              >
                <option value="area">Area</option>
                <option value="city">City</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {searchType === 'name' ? <User className="h-4 w-4" /> : 
                 searchType === 'city' ? <MapPin className="h-4 w-4" /> :
                 <MapPin className="h-4 w-4" />}
              </span>
              <input
                type="text"
                placeholder={
                  searchType === 'name' ? "e.g., John Doe, Ahmed Ali..." :
                  searchType === 'city' ? "e.g., Dhaka, Chittagong..." :
                  "e.g., Dhanmondi, Gulshan..."
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex-shrink-0 font-medium shadow-sm disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Farmers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <FarmerCardSkeleton key={i} />
          ))}
        </div>
      ) : farmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} sendRequest={sendRequest} navigateToProfile={navigateToProfile} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 rounded-lg shadow-sm border border-gray-200">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Farmers Found</h3>
          <p className="text-gray-500 mt-1">
            {searchValue.trim() ? 'Try adjusting your search criteria.' : 'Try searching to find farmers in other areas.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default FindFarmersTab