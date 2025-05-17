"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { cn } from "@/lib/utils"

export function CustomNode({ id, data, isConnectable, selected }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label || "New Node")
  const inputRef = useRef<HTMLInputElement>(null)
  const hasChildren = data.expanded !== undefined

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle double click to edit
  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value)
  }

  // Handle blur to save changes
  const handleBlur = () => {
    setIsEditing(false)
    // Only update if the label has changed
    if (label !== data.label) {
      data.onChange?.(id, label)
    }
  }

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
      // Only update if the label has changed
      if (label !== data.label) {
        data.onChange?.(id, label)
      }
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setLabel(data.label)
    }
  }

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg shadow-md border border-gray-200 min-w-[150px] max-w-[250px]",
        selected ? "ring-2 ring-offset-2" : "",
        data.loading ? "animate-pulse" : "",
      )}
      style={{ backgroundColor: data.color || "#3b82f6" }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-gray-700" />

      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-white bg-opacity-90 px-2 py-1 rounded text-black"
            autoFocus
          />
        ) : (
          <div className="flex-1 text-white font-medium break-words">{data.label || "New Node"}</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-gray-700" />
    </div>
  )
}
