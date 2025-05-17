import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://yourdomain.com", // optional
    "X-Title": "IdeaSpark Mind Mapper",        // optional
  },
});

export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o",
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
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm sorry, I encountered an error while generating a response.";
  }
}

export async function generateRelatedIdeas(nodeText: string, parentText?: string): Promise<string[]> {
  try {
    let prompt = `Generate 3-5 concise, distinct child concepts or actionable ideas for a mind map node titled "${nodeText}"`;

    if (parentText) {
      prompt += ` which is under the parent node "${parentText}"`;
    }

    prompt += `. Return only the ideas as a numbered list, with each idea being 1-5 words.`;

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
    });

    const content = response.choices[0]?.message?.content || "";

    const ideas = content
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.\s+/))
      .map((line) => line.replace(/^\d+\.\s+/, "").trim());

    return ideas.length > 0
      ? ideas
      : ["Related concept 1", "Related concept 2", "Related concept 3"];
  } catch (error) {
    console.error("Error generating ideas:", error);
    return ["Related concept 1", "Related concept 2", "Related concept 3"];
  }
}
