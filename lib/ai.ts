import { OpenAI } from "openai"

// Initialize OpenAI client with the environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For client-side usage in this demo app
})

export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides concise and informative responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
  } catch (error) {
    console.error("Error generating chat response:", error)
    return "I'm sorry, I encountered an error while generating a response."
  }
}

/**
 * Generates related ideas for a mind map node using OpenAI
 * @param nodeText The text of the current node
 * @param parentText Optional text of the parent node for context
 * @returns Array of generated ideas as strings
 */
export async function generateRelatedIdeas(nodeText: string, parentText?: string): Promise<string[]> {
  try {
    // Create a prompt for the AI
    let prompt = `Generate 3-5 concise, distinct child concepts or actionable ideas for a mind map node titled "${nodeText}"`

    // Add parent context if available
    if (parentText) {
      prompt += ` which is under the parent node "${parentText}"`
    }

    prompt += `. Return only the ideas as a numbered list, with each idea being 1-5 words.`

    // Generate ideas using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a creative mind mapping assistant. Generate concise, insightful ideas that expand on concepts. Each idea should be 1-5 words only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || ""

    // Parse the response into an array of ideas
    const ideas = content
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.\s+/)) // Match lines starting with a number and period
      .map((line) => line.replace(/^\d+\.\s+/, "").trim()) // Remove the numbering
      .filter((idea) => idea.length > 0) // Filter out empty lines

    // If no ideas were found, return a default set
    if (ideas.length === 0) {
      return ["Related concept 1", "Related concept 2", "Related concept 3"]
    }

    return ideas
  } catch (error) {
    console.error("Error generating ideas:", error)
    // Return fallback ideas in case of an error
    return ["Related concept 1", "Related concept 2", "Related concept 3"]
  }
}

/**
 * Creates a server-side API route for idea generation to protect API keys
 * This is a more secure approach than client-side API calls
 */
export async function generateIdeasServerSide(nodeText: string, parentText?: string): Promise<string[]> {
  try {
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
    return data.ideas
  } catch (error) {
    console.error("Error calling idea generation API:", error)
    return ["Related concept 1", "Related concept 2", "Related concept 3"]
  }
}
