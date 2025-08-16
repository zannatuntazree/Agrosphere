import Image from "next/image"
import { MapPin, ArrowDown, ArrowUp, Clock, Check, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const RequestItemSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg">
    <div className="flex items-center gap-4 flex-1">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <div className="flex gap-2 mt-3 sm:mt-0">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  </div>
)

const RequestsTabSkeleton = () => (
  <div className="space-y-8">
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <RequestItemSkeleton key={i} />
        ))}
      </div>
    </div>
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        {[...Array(1)].map((_, i) => (
          <RequestItemSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

const RequestItem = ({ request, isReceived, handleResponse, navigateToProfile }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 transition-colors">
    <div
      className="flex items-center gap-4 flex-1 cursor-pointer"
      onClick={() => navigateToProfile(request.other_user_id)}
    >
      <div className="relative h-12 w-12 flex-shrink-0">
        <Image
          src={request.other_user_profile_pic || '/default-avatar.png'}
          alt={request.other_user_name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 hover:text-green-600">{request.other_user_name || 'Unknown User'}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {request.other_user_area || 'Location not specified'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {isReceived ? 'Received on' : 'Sent on'} {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>

    <div className="flex gap-2 mt-3 sm:mt-0" onClick={(e) => e.stopPropagation()}>
      {isReceived ? (
        <>
          <button
            onClick={() => handleResponse(request.id, 'accepted')}
            className="flex cursor-pointer items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded-full transition-colors"
          >
            <Check className="h-4 w-4" /> Accept
          </button>
          <button
            onClick={() => handleResponse(request.id, 'rejected')}
            className="flex cursor-pointer items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2 px-3 rounded-full transition-colors"
          >
            <X className="h-4 w-4" /> Decline
          </button>
        </>
      ) : (
        <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      )}
    </div>
  </div>
)

const RequestsTab = ({ requests, handleResponse, navigateToProfile, isLoading }) => {
  if (isLoading) {
    return <RequestsTabSkeleton />
  }

  const receivedRequests = requests.filter((req) => req.request_direction === 'received' && req.status === 'pending')
  const sentRequests = requests.filter((req) => req.request_direction === 'sent' && req.status === 'pending')

  if (requests.filter((req) => req.status === 'pending').length === 0) {
    return (
      <div className="text-center p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Clock className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Pending Connection Requests</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your pending sent and received requests will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {receivedRequests.length > 0 && (
        <div className="p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            <ArrowDown className="h-6 w-6 text-blue-600" />
            Requests Received
            <span className="text-base font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{receivedRequests.length}</span>
          </h2>
          <div className="space-y-3">
            {receivedRequests.map((req) => (
              <RequestItem key={req.id} request={req} isReceived={true} handleResponse={handleResponse} navigateToProfile={navigateToProfile} />
            ))}
          </div>
        </div>
      )}

      {sentRequests.length > 0 && (
         <div className="p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
            <ArrowUp className="h-6 w-6 text-orange-500" />
            Requests Sent
            <span className="text-base font-semibold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">{sentRequests.length}</span>
          </h2>
          <div className="space-y-3">
            {sentRequests.map((req) => (
              <RequestItem key={req.id} request={req} isReceived={false} handleResponse={handleResponse} navigateToProfile={navigateToProfile} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsTab