"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { v4 as uuidv4 } from "uuid"
import { Toolbar } from "./toolbar"
import { NodeToolbar } from "./node-toolbar"
import { CustomNode } from "./custom-node"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { PlusCircle, Sparkles } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Register custom node types
const nodeTypes = {
  custom: CustomNode,
}

// Initial nodes and edges for a new mind map
const getInitialNodes = (
  id: string,
  editNodeLabel: (id: string, newLabel: string) => void,
  setIsEditing: (editing: boolean) => void
): Node[] => [
  {
    id: "1",
    type: "custom",
    data: {
      label: "Central Idea",
      expanded: true,
      color: "#3b82f6",
      onChange: editNodeLabel,
      onStartEditing: () => setIsEditing(true),
      onStopEditing: () => setIsEditing(false),
    },
    position: { x: 0, y: 0 },
  },
]


const initialEdges: Edge[] = []

type MindMapProps = {
  mapId: string | null
  onCreateNewMap: () => string
}

type MindMapData = {
  id: string
  title: string
  nodes: Node[]
  edges: Edge[]
  createdAt: Date
  updatedAt: Date
}

function MindMapContent({ mapId, onCreateNewMap }: MindMapProps) {
  const { toast } = useToast()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [isNewMapDialogOpen, setIsNewMapDialogOpen] = useState(false)
  const [newMapTitle, setNewMapTitle] = useState("")
  const [currentMapData, setCurrentMapData] = useState<MindMapData | null>(null)
  const [isEditing, setIsEditing] = useState(false) // Track if user is editing a node

  const reactFlowInstance = useReactFlow()

  // Load mind map data when mapId changes
  useEffect(() => {
    if (!mapId) {
      // If no mapId is provided, show the new map dialog
      setIsNewMapDialogOpen(true)
      return
    }

    // Try to load the map from local storage
    const savedMaps = localStorage.getItem("ideaSparkMaps")
    if (savedMaps) {
      try {
        const parsedMaps: MindMapData[] = JSON.parse(savedMaps)
        const currentMap = parsedMaps.find((map) => map.id === mapId)

        if (currentMap) {
          // Map exists, load it
          setNodes(currentMap.nodes)
          setEdges(currentMap.edges)
          setCurrentMapData(currentMap)
          setIsNewMapDialogOpen(false)
        } else {
          // Map doesn't exist, create a new one
          const newMap: MindMapData = {
            id: mapId,
            title: "Untitled Mind Map",
            nodes: getInitialNodes(mapId, editNodeLabel, setIsEditing),
            edges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          setNodes(newMap.nodes)
          setEdges(newMap.edges)
          setCurrentMapData(newMap)

          // Save the new map
          const updatedMaps = [...parsedMaps, newMap]
          localStorage.setItem("ideaSparkMaps", JSON.stringify(updatedMaps))
        }
      } catch (error) {
        console.error("Failed to load mind map:", error)
        toast({
          title: "Error loading mind map",
          description: "Failed to load the mind map. Creating a new one.",
          variant: "destructive",
        })

        // Create a new map if loading fails
        createNewMindMap(mapId)
      }
    } else {
      // No maps exist yet, create a new one
      createNewMindMap(mapId)
    }
  }, [mapId, setNodes, setEdges, toast])

  // Save mind map data when nodes or edges change
  useEffect(() => {
    if (!currentMapData || nodes.length === 0) return

    // Debounce the save operation
    const saveTimeout = setTimeout(() => {
      const updatedMap: MindMapData = {
        ...currentMapData,
        nodes,
        edges,
        updatedAt: new Date(),
      }

      const savedMaps = localStorage.getItem("ideaSparkMaps")
      if (savedMaps) {
        try {
          const parsedMaps: MindMapData[] = JSON.parse(savedMaps)
          const updatedMaps = parsedMaps.map((map) => (map.id === updatedMap.id ? updatedMap : map))

          localStorage.setItem("ideaSparkMaps", JSON.stringify(updatedMaps))
          setCurrentMapData(updatedMap)
        } catch (error) {
          console.error("Failed to save mind map:", error)
        }
      } else {
        localStorage.setItem("ideaSparkMaps", JSON.stringify([updatedMap]))
      }
    }, 500)

    return () => clearTimeout(saveTimeout)
  }, [nodes, edges, currentMapData])

  // Create a new mind map
  const createNewMindMap = (id: string, title = "Untitled Mind Map") => {
    const newMap: MindMapData = {
      id,
      title,
      nodes: getInitialNodes(id, editNodeLabel, setIsEditing),
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNodes(newMap.nodes)
    setEdges(newMap.edges)
    setCurrentMapData(newMap)

    // Save the new map
    const savedMaps = localStorage.getItem("ideaSparkMaps")
    if (savedMaps) {
      try {
        const parsedMaps: MindMapData[] = JSON.parse(savedMaps)
        const updatedMaps = [...parsedMaps, newMap]
        localStorage.setItem("ideaSparkMaps", JSON.stringify(updatedMaps))
      } catch (error) {
        console.error("Failed to save new mind map:", error)
        localStorage.setItem("ideaSparkMaps", JSON.stringify([newMap]))
      }
    } else {
      localStorage.setItem("ideaSparkMaps", JSON.stringify([newMap]))
    }

    toast({
      title: "New mind map created",
      description: "Start adding ideas to your mind map!",
    })
  }

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: false }, eds))
    },
    [setEdges],
  )

  // Handle node click to select it
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Close node selection when clicking elsewhere
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Add a new node
  const addNode = useCallback(
    (parentId: string, label: string, color?: string) => {
      const parentNode = nodes.find((node) => node.id === parentId)
      if (!parentNode) return

      // Generate a unique ID for the new node
      const newNodeId = uuidv4()

      // Calculate position for the new node
      // For simplicity, place it below the parent node
      const parentPosition = parentNode.position
      const childrenCount = nodes.filter((node) =>
        edges.some((edge) => edge.source === parentId && edge.target === node.id),
      ).length

      const newPosition = {
        x: parentPosition.x + 250,
        y: parentPosition.y + childrenCount * 100,
      }

      // Create the new node
      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        data: {
          label,
          expanded: true,
          color: color || "#3b82f6", // Default to blue if no color specified
          onChange: (id: string, newLabel: string) => {
            editNodeLabel(id, newLabel)
          },
          onStartEditing: () => setIsEditing(true),
          onStopEditing: () => setIsEditing(false),
        },
        position: newPosition,
      }

      // Add the new node and connect it to the parent
      setNodes((nds) => [...nds, newNode])
      setEdges((eds) => [
        ...eds,
        {
          id: `e${parentId}-${newNodeId}`,
          source: parentId,
          target: newNodeId,
          animated: false,
        },
      ])

      return newNodeId
    },
    [nodes, edges, setNodes, setEdges],
  )

  // Edit node label
  const editNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
                onChange: node.data.onChange,
                onStartEditing: node.data.onStartEditing,
                onStopEditing: node.data.onStopEditing,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Change node color
  const changeNodeColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                color,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Toggle node expansion
  const toggleNodeExpansion = useCallback(
    (nodeId: string) => {
      // Find the node to toggle
      const nodeToToggle = nodes.find((node) => node.id === nodeId)
      if (!nodeToToggle) return

      // Toggle the expanded state
      const newExpandedState = !nodeToToggle.data.expanded

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                expanded: newExpandedState,
              },
            }
          }
          return node
        }),
      )

      // Find all child nodes (direct and indirect)
      const findAllChildren = (parentId: string): string[] => {
        const directChildren = edges.filter((edge) => edge.source === parentId).map((edge) => edge.target)

        const allChildren = [...directChildren]

        directChildren.forEach((childId) => {
          allChildren.push(...findAllChildren(childId))
        })

        return allChildren
      }

      const childNodeIds = findAllChildren(nodeId)

      // Hide or show all child nodes
      setNodes((nds) =>
        nds.map((node) => {
          if (childNodeIds.includes(node.id)) {
            return {
              ...node,
              hidden: !newExpandedState,
            }
          }
          return node
        }),
      )
    },
    [nodes, edges, setNodes],
  )

  // Delete a node and its children
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Find all child nodes (direct and indirect)
      const findAllChildren = (parentId: string): string[] => {
        const directChildren = edges.filter((edge) => edge.source === parentId).map((edge) => edge.target)

        const allChildren = [...directChildren]

        directChildren.forEach((childId) => {
          allChildren.push(...findAllChildren(childId))
        })

        return allChildren
      }

      const childNodeIds = findAllChildren(nodeId)
      const nodeIdsToRemove = [nodeId, ...childNodeIds]

      // Remove the nodes
      setNodes((nds) => nds.filter((node) => !nodeIdsToRemove.includes(node.id)))

      // Remove the edges
      setEdges((eds) =>
        eds.filter((edge) => !nodeIdsToRemove.includes(edge.source) && !nodeIdsToRemove.includes(edge.target)),
      )

      // Clear selected node if it was deleted
      if (selectedNode && nodeIdsToRemove.includes(selectedNode.id)) {
        setSelectedNode(null)
      }
    },
    [edges, setNodes, setEdges, selectedNode],
  )

  // Generate AI ideas for a node
  const generateNodeIdeas = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      // Find the parent node to provide context
      const parentEdge = edges.find((edge) => edge.target === nodeId)
      const parentNode = parentEdge ? nodes.find((n) => n.id === parentEdge.source) : null

      const nodeText = node.data.label
      const parentText = parentNode?.data.label || ""

      setLoading(nodeId)

      try {
        // Use the server-side API route for idea generation
        const response = await fetch("/api/generate-ideas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodeText, parentText }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        const ideas = data.ideas || []

        if (ideas.length === 0) {
          throw new Error("No ideas were generated")
        }

        // Add each idea as a child node
        ideas.forEach((idea: string) => {
          addNode(nodeId, idea)
        })

        toast({
          title: "Ideas generated",
          description: `${ideas.length} new ideas have been added to your mind map.`,
        })
      } catch (error) {
        console.error("Failed to generate ideas:", error)

        // Add fallback ideas if generation fails
        const fallbackIdeas = ["Related concept 1", "Related concept 2", "Related concept 3"]
        fallbackIdeas.forEach((idea) => {
          addNode(nodeId, idea)
        })

        toast({
          title: "Using fallback ideas",
          description: "Could not connect to AI. Added some placeholder ideas instead.",
          variant: "destructive",
        })
      } finally {
        setLoading(null)
      }
    },
    [nodes, edges, addNode, toast],
  )

  // Tidy up the mind map layout
  const tidyUpMap = useCallback(() => {
    // Simple implementation for the hackathon
    // Recursively position nodes in a tree layout
    const positionNode = (
      nodeId: string,
      x: number,
      y: number,
      horizontalSpacing: number,
      verticalSpacing: number,
      visited: Set<string> = new Set(),
    ): { width: number; height: number } => {
      if (visited.has(nodeId)) return { width: 0, height: 0 }
      visited.add(nodeId)

      // Update the position of the current node
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              position: { x, y },
            }
          }
          return node
        }),
      )

      // Find all children of this node
      const childEdges = edges.filter((edge) => edge.source === nodeId)
      const childIds = childEdges.map((edge) => edge.target)

      if (childIds.length === 0) {
        return { width: 200, height: 50 } // Default node size
      }

      let totalHeight = 0
      let maxChildWidth = 0

      // Position each child
      childIds.forEach((childId, index) => {
        const childY = y + totalHeight
        const childX = x + horizontalSpacing

        const { width, height } = positionNode(childId, childX, childY, horizontalSpacing, verticalSpacing, visited)

        totalHeight += height + verticalSpacing
        maxChildWidth = Math.max(maxChildWidth, width)
      })

      return {
        width: 200 + maxChildWidth, // Node width + max child width
        height: Math.max(50, totalHeight - verticalSpacing), // Node height or total children height
      }
    }

    // Start positioning from the root node(s)
    // For simplicity, assume the first node is the root
    if (nodes.length > 0) {
      positionNode(nodes[0].id, 50, 50, 250, 100)

      toast({
        title: "Mind map tidied up",
        description: "Your mind map has been reorganized for better readability.",
      })
    }
  }, [nodes, edges, setNodes, toast])

  // Handle keyboard shortcuts - MODIFIED to prevent backspace/delete from deleting nodes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if we're not editing a node
      if (isEditing) return

      // Get the currently selected node
      if (!selectedNode) return

      // We've removed the Delete/Backspace handler to prevent accidental node deletion
      // Now nodes can only be deleted via the delete button in the toolbar
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedNode, isEditing])

  // Handle new map creation
  const handleCreateNewMap = () => {
    if (!newMapTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your mind map.",
        variant: "destructive",
      })
      return
    }

    const newMapId = onCreateNewMap()
    createNewMindMap(newMapId, newMapTitle)
    setIsNewMapDialogOpen(false)
    setNewMapTitle("")
  }

  // Update map title
  const updateMapTitle = (title: string) => {
    if (!currentMapData) return

    const updatedMap = {
      ...currentMapData,
      title,
      updatedAt: new Date(),
    }

    setCurrentMapData(updatedMap)

    const savedMaps = localStorage.getItem("ideaSparkMaps")
    if (savedMaps) {
      try {
        const parsedMaps: MindMapData[] = JSON.parse(savedMaps)
        const updatedMaps = parsedMaps.map((map) => (map.id === updatedMap.id ? updatedMap : map))

        localStorage.setItem("ideaSparkMaps", JSON.stringify(updatedMaps))
      } catch (error) {
        console.error("Failed to update map title:", error)
      }
    }
  }

  // Add a new root node when no nodes exist
  const addRootNode = () => {
    if (nodes.length === 0) {
      const newNodeId = "1"
      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        data: {
          label: "Central Idea",
          expanded: true,
          color: "#3b82f6",
          onChange: (id: string, newLabel: string) => {
            editNodeLabel(id, newLabel)
          },
          onStartEditing: () => setIsEditing(true),
          onStopEditing: () => setIsEditing(false),
        },
        position: { x: 0, y: 0 },
      }
      setNodes([newNode])
    }
  }

  return (
    <div className="w-full h-full absolute inset-0" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ width: "100%", height: "100%" }}
        defaultEdgeOptions={{ animated: false }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <Toolbar
            title={currentMapData?.title || "Untitled Mind Map"}
            onUpdateTitle={updateMapTitle}
            onTidyUp={tidyUpMap}
          />
        </Panel>

        {selectedNode && (
          <NodeToolbar
            node={selectedNode}
            onAddChild={(id) => {
              const newNodeId = addNode(id, "New Idea")
              setSelectedNode(null)
            }}
            onEdit={(id, label) => {
              editNodeLabel(id, label)
            }}
            onDelete={(id) => {
              deleteNode(id)
            }}
            onChangeColor={(id, color) => {
              changeNodeColor(id, color)
            }}
            onToggleExpand={(id) => {
              toggleNodeExpansion(id)
            }}
            onGenerateIdeas={(id) => {
              generateNodeIdeas(id)
            }}
            loading={loading === selectedNode.id}
          />
        )}

        {/* Add Node Button (visible when no node is selected) */}
        {!selectedNode && (
          <Panel position="bottom-right" className="p-4">
            <Button
              onClick={() => {
                if (nodes.length > 0) {
                  // If nodes exist, add to the root node
                  const rootNodeId = nodes[0].id
                  addNode(rootNodeId, "New Idea")
                } else {
                  // If no nodes exist, create a root node
                  addRootNode()
                }
              }}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add Idea
            </Button>
          </Panel>
        )}
      </ReactFlow>

      {/* New Mind Map Dialog */}
      <Dialog open={isNewMapDialogOpen} onOpenChange={setIsNewMapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mind Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Mind Map Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your mind map"
                value={newMapTitle}
                onChange={(e) => setNewMapTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNewMap()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateNewMap}>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Mind Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function MindMap(props: MindMapProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlowProvider>
        <MindMapContent {...props} />
      </ReactFlowProvider>
    </div>
  )
}
