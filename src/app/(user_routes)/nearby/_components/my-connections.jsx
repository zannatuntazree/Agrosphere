import Link from "next/link"
import Image from "next/image"
import { Users, MapPin, Phone } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const ConnectionCard = ({ connection }) => {
  const { friend_info } = connection
  return (
    <Link href={`/profile/${friend_info.id}`} className="block h-full">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full p-4 dark:bg-gray-800">
        <div className="flex-grow">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 flex-shrink-0">
              <Image
                src={friend_info.profile_pic || '/default-avatar.png'}
                alt={friend_info.name || 'Farmer'}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate hover:text-green-600 dark:hover:text-green-400">
                {friend_info.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4" />
                {friend_info.area && friend_info.city ? `${friend_info.area}, ${friend_info.city}` : friend_info.area || friend_info.city || 'N/A'}
              </p>
              {friend_info.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                  <Phone className="h-4 w-4" />
                  {friend_info.phone}
                </p>
              )}
            </div>
          </div>
           {friend_info.preferred_crops && friend_info.preferred_crops.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {friend_info.preferred_crops.slice(0, 3).map((crop) => (
              <span key={crop} className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
                {crop}
              </span>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-4">
           <p className="text-xs text-gray-400 dark:text-gray-500">
            Connected since {new Date(connection.connected_since).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  )
}

const ConnectionCardSkeleton = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col h-full p-4 dark:bg-gray-800">
      <div className="flex-grow">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-4">
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

const ConnectionsTabSkeleton = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <ConnectionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

const ConnectionsTab = ({ connections, isLoading = false }) => {
  if (isLoading) {
    return <ConnectionsTabSkeleton />
  }

  return (
  <div className="p-4 sm:p-6 ">
    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white mb-4">
    My Connections
    <span className="text-base font-semibold bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full">{connections.length}</span>
    </h2>
    
    {connections.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((connection) => (
      <ConnectionCard key={connection.connection_id} connection={connection} />
      ))}
    </div>
    ) : (
    <div className="text-center py-12">
      <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Connections Yet</h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1">Go to the "Find Farmers" tab to start building your network.</p>
    </div>
    )}
  </div>
  )
}

export default ConnectionsTab
export { ConnectionsTabSkeleton }