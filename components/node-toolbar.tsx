"use client"

import { useState } from "react"
import type { Node } from "reactflow"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Palette, ChevronDown, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface NodeToolbarProps {
  node: Node
  onAddChild: (id: string) => void
  onEdit: (id: string, label: string) => void
  onDelete: (id: string) => void
  onChangeColor: (id: string, color: string) => void
  onToggleExpand: (id: string) => void
  onGenerateIdeas: (id: string) => void
  loading?: boolean
}

export function NodeToolbar({
  node,
  onAddChild,
  onEdit,
  onDelete,
  onChangeColor,
  onToggleExpand,
  onGenerateIdeas,
  loading = false,
}: NodeToolbarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(node.data.label)

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

  const handleEditSave = () => {
    if (editValue.trim() !== node.data.label) {
      onEdit(node.id, editValue)
    }
    setIsEditing(false)
  }

  return (
    <div className="absolute top-0 right-0 z-10 bg-white rounded-md shadow-lg p-1 flex items-center space-x-1">
      {isEditing ? (
        <div className="flex items-center">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-48"
            autoFocus
            onBlur={handleEditSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEditSave()
              } else if (e.key === "Escape") {
                setEditValue(node.data.label)
                setIsEditing(false)
              }
            }}
          />
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onAddChild(node.id)}
            title="Add Child Node"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)} title="Edit Node">
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleExpand(node.id)}
            title="Toggle Expand"
          >
            {node.data.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Change Color">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => onChangeColor(node.id, color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onGenerateIdeas(node.id)}
            disabled={loading}
            title="Generate Ideas"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(node.id)}
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
