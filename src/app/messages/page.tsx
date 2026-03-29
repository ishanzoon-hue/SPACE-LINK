import { createClient } from '@/utils/supabase/server'
import InboxSidebar from '@/components/InboxSidebar'
import { MessageSquarePlus } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Please log in to view messages.</div>
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white dark:bg-[#020817] container max-w-7xl mx-auto px-0 md:px-4">
      {/* Sidebar List - Takes full width on mobile, fixed width on desktop */}
      <div className="w-full md:w-[350px] shrink-0 h-full border-x md:border-l-0 border-gray-200 dark:border-gray-800">
        <InboxSidebar currentUserId={user.id} />
      </div>

      {/* Main Content - Hidden on mobile, shows empty state on desktop */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/50 dark:bg-[#0F172A]/30 border-r border-gray-200 dark:border-gray-800">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
          <MessageSquarePlus size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Your Messages</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-center max-w-sm">
          Select a conversation from the sidebar to start a chat, or find a friend on the network to connect with.
        </p>
      </div>
    </div>
  )
}