import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

// Lazily create the event handler for the /api/chat endpoint
export default defineLazyEventHandler(async () => {
  // Handle each incoming HTTP request
  return defineEventHandler(async (event: any) => {
    // Read the UI-level chat messages sent from the frontend
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    // Start a streaming text generation using OpenAI gpt-5.1
    const result = streamText({
      model: openai('gpt-5.1'),
      // Convert UI messages into the format expected by the model
      messages: convertToModelMessages(messages),
    });

    // Return the model output as a streaming response that the frontend can consume
    return result.toUIMessageStreamResponse();
  });
});