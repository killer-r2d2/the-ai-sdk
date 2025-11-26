import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
// @ts-ignore - Anthropic module is available at runtime; ambient types are provided separately
import { anthropic } from "@ai-sdk/anthropic";

// Lazily create the event handler for the /api/chat endpoint
export default defineLazyEventHandler(async () => {
  // Handle each incoming HTTP request
  return defineEventHandler(async (event: any) => {
    // Read the UI-level chat messages sent from the frontend
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    // Start a streaming text generation using Anthropic (v2-compatible) only
    const result = streamText({
      // Use a v2-compatible Anthropic model; IDs ending in 3.5 were removed in v2.
      model: anthropic("claude-3-7-sonnet-latest"),
      // Convert UI messages into the format expected by the model
      messages: convertToModelMessages(messages),
    });

    // Return the model output as a streaming response that the frontend can consume
    return result.toUIMessageStreamResponse();
  });
});