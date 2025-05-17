"use client"

import { useState } from "react"

import { useRef, useEffect } from "react"
import { Plus, Edit, Trash2, Palette, ChevronDown, ChevronRight, Sparkles, Loader2 } from "lucide-react"

interface NodeContextMenuProps {
  id: string
  x: number
  y: number
  onClose: () => void
  onAddChild: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onChangeColor: (id: string, color: string) => void
  onToggleExpand: (id: string) => void
  onGenerateIdeas: (id: string) => void
  loading?: boolean
}

export function NodeContextMenu({
  id,
  x,
  y,
  onClose,
  onAddChild,
  onEdit,
  onDelete,
  onChangeColor,
  onToggleExpand,
  onGenerateIdeas,
  loading = false,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Available colors
  const colors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
  ]

  return (
    <div
      ref={menuRef}
      className="absolute bg-white rounded-md shadow-lg z-10 min-w-[180px]"
      style={{ top: y, left: x }}
    >
      <div className="py-1">
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => onAddChild(id)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Child Node
        </button>

        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => onEdit(id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Node
        </button>

        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => onToggleExpand(id)}
        >
          {showColorPicker ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
          Toggle Expand
        </button>

        <div className="relative">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <Palette className="mr-2 h-4 w-4" />
            Change Color
            {showColorPicker ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </button>

          {showColorPicker && (
            <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-20 p-2">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => onChangeColor(id, color)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          onClick={() => onGenerateIdeas(id)}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Spark Ideas ✨
        </button>

        <div className="border-t border-gray-200 my-1"></div>

        <button
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Node
        </button>
      </div>
    </div>
  )
}
