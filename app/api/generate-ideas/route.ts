import { OpenAI } from "openai"
import { NextResponse } from "next/server"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { nodeText, parentText } = await request.json()

    if (!nodeText) {
      return NextResponse.json({ error: "Node text is required" }, { status: 400 })
    }

    // Create a prompt for the AI
    let prompt = `Generate 3-5 concise, distinct child concepts or actionable ideas for a mind map node titled "${nodeText}"`

    // Add parent context if available
    if (parentText) {
      prompt += ` which is under the parent node "${parentText}"`
    }

    prompt += `. Return only the ideas as a numbered list, with each idea being 1-5 words.`

    // Generate ideas using OpenAI
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-8b-instruct:free",
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
      return NextResponse.json({
        ideas: ["Related concept 1", "Related concept 2", "Related concept 3"],
      })
    }

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error("Error generating ideas:", error)
    return NextResponse.json(
      {
        error: "Failed to generate ideas",
        ideas: ["Related concept 1", "Related concept 2", "Related concept 3"],
      },
      { status: 500 },
    )
  }
}
