import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model: openai('gpt-5.1'),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
});