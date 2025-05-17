"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Map, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

type MindMap = {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

type SidebarProps = {
  onMapSelect: (mapId: string) => void
  currentMapId: string | null
  onCreateNewMap: () => string
}

export function Sidebar({ onMapSelect, currentMapId, onCreateNewMap }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [maps, setMaps] = useState<MindMap[]>([])
  const { toast } = useToast()

  // Load maps from local storage on initial render
  useEffect(() => {
    const savedMaps = localStorage.getItem("ideaSparkMaps")
    if (savedMaps) {
      try {
        const parsedMaps = JSON.parse(savedMaps)
        // Convert string dates back to Date objects
        const formattedMaps = parsedMaps.map((map: any) => ({
          ...map,
          createdAt: new Date(map.createdAt),
          updatedAt: new Date(map.updatedAt),
        }))
        setMaps(formattedMaps)
      } catch (error) {
        console.error("Failed to load maps from local storage:", error)
      }
    }
  }, [])

  // Update maps in state when a map is updated
  const updateMapsFromStorage = () => {
    const savedMaps = localStorage.getItem("ideaSparkMaps")
    if (savedMaps) {
      try {
        const parsedMaps = JSON.parse(savedMaps)
        // Convert string dates back to Date objects
        const formattedMaps = parsedMaps.map((map: any) => ({
          ...map,
          createdAt: new Date(map.createdAt),
          updatedAt: new Date(map.updatedAt),
        }))
        setMaps(formattedMaps)
      } catch (error) {
        console.error("Failed to load maps from local storage:", error)
      }
    }
  }

  // Listen for storage events to update maps when they change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ideaSparkMaps") {
        updateMapsFromStorage()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also set up an interval to check for updates
    const interval = setInterval(updateMapsFromStorage, 2000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const createNewMap = () => {
    const newMapId = onCreateNewMap()

    toast({
      title: "New mind map created",
      description: "Start adding ideas to your new mind map!",
    })

    return newMapId
  }

  const deleteMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (window.confirm("Are you sure you want to delete this mind map?")) {
      const savedMaps = localStorage.getItem("ideaSparkMaps")
      if (savedMaps) {
        try {
          const parsedMaps: MindMap[] = JSON.parse(savedMaps)
          const updatedMaps = parsedMaps.filter((map) => map.id !== id)
          localStorage.setItem("ideaSparkMaps", JSON.stringify(updatedMaps))
          setMaps(updatedMaps)

          // If the current map is deleted, select another one or create a new one
          if (currentMapId === id) {
            if (updatedMaps.length > 0) {
              onMapSelect(updatedMaps[0].id)
            } else {
              createNewMap()
            }
          }

          toast({
            title: "Mind map deleted",
            description: "Your mind map has been deleted.",
          })
        } catch (error) {
          console.error("Failed to delete map:", error)
        }
      }
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" })
  }

  return (
    <div
      className={cn(
        "bg-gray-100 border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && <h2 className="font-semibold">IdeaSpark</h2>}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="p-2">
        <Button onClick={createNewMap} className="w-full justify-start gap-2">
          <PlusCircle size={18} />
          {!isCollapsed && "New Mind Map"}
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center">
            <Map size={18} className="mr-2" />
            {!isCollapsed && <span className="font-medium">Your Mind Maps</span>}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-240px)]">
          <div className="p-2 space-y-1">
            {maps.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                {!isCollapsed && "No mind maps yet. Create one to get started!"}
              </div>
            ) : (
              maps
                .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                .map((map) => (
                  <div
                    key={map.id}
                    className={cn(
                      "group flex items-center justify-between rounded-md",
                      currentMapId === map.id ? "bg-blue-100" : "hover:bg-gray-200",
                      isCollapsed ? "px-2 py-2" : "px-3 py-2",
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left truncate p-0 h-auto",
                        currentMapId === map.id ? "text-blue-600 font-medium" : "text-gray-700",
                      )}
                      onClick={() => onMapSelect(map.id)}
                    >
                      {isCollapsed ? (
                        <Map size={18} className="mx-auto" />
                      ) : (
                        <span className="truncate">{map.title}</span>
                      )}
                    </Button>

                    {!isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteMap(map.id, e)}
                      >
                        <span className="sr-only">Delete</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
