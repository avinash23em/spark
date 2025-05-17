import OpenAI from "openai";

// Ensure your OpenAI client is configured correctly.
// The API key should be set as an environment variable in Vercel.
// For HTTP-Referer, use your actual deployed Vercel URL (e.g., https://your-project.vercel.app)
// or your custom domain if you have one.
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is correctly set in Vercel
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com", // Replace with your actual site URL, ideally from an env var
    "X-Title": "IdeaSpark Mind Mapper", // Optional
  },
});

// Your generateChatResponse function (assuming it's working as expected)
export async function generateChatResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o", // Or any other model you prefer for general chat
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
    // Consider returning the error message or a more specific error.
    // For debugging, you might want to throw the error to see it in Vercel logs.
    // throw error; 
    return "I'm sorry, I encountered an error while generating a response.";
  }
}


export async function generateRelatedIdeas(nodeText: string, parentText?: string): Promise<string[]> {
  try {
    let prompt = `Generate 3-5 concise, distinct child concepts or actionable ideas for a mind map node titled "${nodeText}"`;

    if (parentText) {
      prompt += ` which is under the parent node "${parentText}"`;
    }

    // Revised prompt: Asking for a simpler format.
    // Llama models might follow simpler instructions more reliably.
    prompt += `. Each idea should be on a new line. Do not use any numbering or bullet points. Each idea should be 1-5 words.`;

    console.log("Sending prompt to Llama model:", prompt); // Log the exact prompt

    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-8b-instruct:free", // Correct model for OpenRouter
      messages: [
        {
          role: "system",
          content:
            "You are a creative mind mapping assistant. Generate concise, insightful ideas that expand on concepts. Each idea should be 1-5 words only, and each idea on a new line.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200, // Should be enough for 3-5 short ideas
    });

    const rawContent = response.choices[0]?.message?.content || "";
    console.log("Raw response content from Llama model:", JSON.stringify(rawContent)); // CRITICAL: Log the raw response

    if (!rawContent.trim()) {
        console.warn("Received empty content from the API.");
        // Fallback if the API returns completely empty content
        return ["Idea A (fallback)", "Idea B (fallback)", "Idea C (fallback)"];
    }

    // Revised parsing logic:
    // Split by newline, trim whitespace, and filter out any empty lines.
    // Also, filter based on a reasonable length for 1-5 words.
    const ideas = rawContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        const wordCount = line.split(' ').filter(Boolean).length;
        // Ensure the line is not empty and has between 1 and 7 words (allows some flexibility)
        // and doesn't look like a leftover instruction or heading.
        return line.length > 0 && wordCount > 0 && wordCount <= 7 && !line.endsWith(":");
      });

    console.log("Parsed ideas:", ideas); // Log the parsed ideas

    if (ideas.length > 0) {
      return ideas;
    } else {
      // If parsing results in no ideas, it means the model's output format was not as expected.
      // The rawContent log above will be key to understanding why.
      console.warn("Parsing resulted in no ideas. Check rawContent log. Using fallback.");
      return ["Check logs: Idea 1", "Check logs: Idea 2", "Check logs: Idea 3"];
    }

  } catch (error) {
    console.error("Error generating ideas with Llama model:", error);
    // For Vercel, logging the error object (JSON.stringify(error) or error.message, error.stack)
    // can give more details about API errors (e.g., auth issues, rate limits).
    // Consider re-throwing or returning a more informative error.
    // throw error; 
    return ["Error: Concept X", "Error: Concept Y", "Error: Concept Z"];
  }
}

