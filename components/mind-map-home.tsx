"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/sidebar"
import { MindMap } from "@/components/mind-map"
import { Toaster } from "@/components/ui/toaster"
import { v4 as uuidv4 } from "uuid"

export function MindMapHome() {
  const { data: session } = useSession()
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)

  // Create a new mind map
  const createNewMap = () => {
    const newMapId = uuidv4()
    setCurrentMapId(newMapId)
    return newMapId
  }

  return (
    <div className="flex h-screen">
      <Sidebar onMapSelect={setCurrentMapId} currentMapId={currentMapId} onCreateNewMap={createNewMap} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">IdeaSpark Mind Mapper</h1>
          <div className="flex items-center space-x-2">
            {session?.user?.image && (
              <img
                src={session.user.image || "/placeholder.svg"}
                alt={session.user.name || "User"}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm font-medium">{session?.user?.name || "User"}</span>
          </div>
        </header>
        <div className="flex-1 relative">
          <MindMap mapId={currentMapId} onCreateNewMap={createNewMap} />
        </div>
      </main>
      <Toaster />
    </div>
  )
}
