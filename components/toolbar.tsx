"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wand2, Edit2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"

interface ToolbarProps {
  title: string
  onUpdateTitle: (title: string) => void
  onTidyUp: () => void
}

export function Toolbar({ title, onUpdateTitle, onTidyUp }: ToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(title)

  const handleTitleChange = () => {
    if (titleValue.trim() !== title) {
      onUpdateTitle(titleValue)
    }
    setIsEditingTitle(false)
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md flex items-center space-x-2">
      <TooltipProvider>
        {isEditingTitle ? (
          <div className="flex items-center">
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="h-8 w-48"
              autoFocus
              onBlur={handleTitleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTitleChange()
                } else if (e.key === "Escape") {
                  setTitleValue(title)
                  setIsEditingTitle(false)
                }
              }}
            />
          </div>
        ) : (
          <div className="flex items-center">
            <h2 className="font-medium text-sm mr-2 max-w-[200px] truncate">{title}</h2>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingTitle(true)}>
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onTidyUp}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tidy Up Layout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
