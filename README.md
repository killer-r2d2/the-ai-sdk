## The AI SDK – Nuxt Demo (Chat + PDF Extraction)

This repository is a **minimal Nuxt 4 + Vue 3 demo** for a 30‑minute talk that shows how to build an AI‑powered chat app using the **AI SDK**.

The goal of the talk: by the end, the audience should understand **what the AI SDK is**, **why it exists**, and **how to use it in a real Nuxt app**.

---

## What is the AI SDK?

The **AI SDK** is an open‑source TypeScript toolkit for building AI features into web apps and backends.

It provides:

- **Unified APIs** for multiple model providers (OpenAI and others)
- **Streaming text and UI helpers** so you can show tokens as they arrive
- **Frontend bindings** (like `@ai-sdk/vue`) that manage chat state and networking for you
- **Type‑safe primitives** you can use in any framework (Next.js, Nuxt, plain Node, etc.)

In this demo, we use:

- **`ai`** – core AI SDK library (`streamText`, message helpers, etc.)
- **`@ai-sdk/openai`** – OpenAI model bindings (available via env switch)
- **`@ai-sdk/anthropic`** – Anthropic model bindings (default chat provider)
- **`@ai-sdk/vue`** – Vue integration with a `Chat` helper

---

## What this demo app does

- **Simple chat UI** built with Vue and Nuxt (`chat.vue`)
- **Chat server endpoint** (`server/api/chat.ts`) that:
  - Uses `streamText` with a model selected via `CHAT_PROVIDER` (Anthropic by default, OpenAI when configured)
  - Streams the model response back to the browser
- **PDF‑to‑structured‑data demo** (`invoice.vue` + `server/api/invoice-extract.post.ts`) that:
  - Lets you upload a PDF invoice from the browser
  - Uses `generateObject` with a Zod schema to extract structured fields
  - Sends the PDF to the model as a `file` content part
  - Returns a JSON object with total, currency, invoice number, and addresses

This is intentionally small so you can explain it comfortably in ~30 minutes.

---

## Architecture overview

- **Frontend – `app.vue`**
  - Uses the `Chat` helper from `@ai-sdk/vue`
  - Renders messages (user vs AI)
  - Sends new messages to the backend using `chat.sendMessage`

Example (simplified):

```ts
<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { ref } from "vue";

const input = ref("");
const chat = new Chat({});

const handleSubmit = (event: Event) => {
  event.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = "";
};
</script>
```

- **Backend – `server/api/chat.ts`**
  - Receives `UIMessage[]` from the frontend
  - Converts them to model messages
  - Calls `streamText` with a model selected by `getChatModel()` (Anthropic by default, OpenAI when `CHAT_PROVIDER=openai`)
  - Returns a streaming response for the UI

Example (simplified):

```ts
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

const chatProviderName =
  process.env.CHAT_PROVIDER && process.env.CHAT_PROVIDER.trim() !== ""
    ? process.env.CHAT_PROVIDER
    : "anthropic";

function getChatModel() {
  if (chatProviderName === "openai") {
    return openai("gpt-5.1");
  }
  return anthropic("claude-3-7-sonnet-latest");
}

export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model: getChatModel(),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
});
```

Together, these pieces show full request/response loops using the AI SDK for:

- Streaming chat completion
- Extracting structured data from unstructured PDF content

The PDF example is inspired by the AIHero tutorial
["Extract Structured Data From PDF's With Vercel's AI SDK"](https://www.aihero.dev/structured-data-from-pdfs-with-vercel-ai-sdk)
and the accompanying example code
[`12-analyze-pdfs/main.ts`](https://github.com/ai-hero-dev/ai-hero/blob/main/examples/vercel-ai-sdk/12-analyze-pdfs/main.ts).

---

## Getting started

### Requirements

- Node.js 18+ recommended
- An OpenAI API key (`OPENAI_API_KEY`) if you want to use OpenAI
- An Anthropic API key (`ANTHROPIC_API_KEY`) if you want to use Anthropic

### 1. Install dependencies

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 2. Configure your API keys and provider

Create a `.env` file in the project root (or set this in your shell):

```bash
# Anthropic (default chat provider)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (optional, used when CHAT_PROVIDER=openai)
OPENAI_API_KEY=sk-openai-...

# Optional: choose provider for the chat endpoint
# - anthropic (default when unset)
# - openai
CHAT_PROVIDER=anthropic
```

### 3. Run the development server

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Open `http://localhost:3000` in your browser.

---

## Using this repo in your 30‑minute talk

You can structure your talk roughly like this:

- **1. Introduce the problem (2–3 min)**
  - Everyone wants to add AI to their apps, but
    - Directly using REST APIs is low‑level and repetitive.
    - You have to wire up streaming, provider differences, types, etc.
  - The AI SDK abstracts these problems in a framework‑friendly way.

- **2. Show the UI code (8–10 min)**
  - Open `app.vue`
  - Explain:
    - `Chat` from `@ai-sdk/vue`
    - Reactive `input`
    - Rendering `chat.messages`
    - `chat.sendMessage({ text })`
  - Emphasize: **the frontend does not know about OpenAI directly** – it just talks to your API.

- **3. Show the backend code (8–10 min)**
  - Open `server/api/chat.ts`
  - Walk through:
    - Reading `messages` from the request
    - `convertToModelMessages(messages)`
    - `streamText({ model: openai("gpt-5.1"), messages })`
    - Returning `result.toUIMessageStreamResponse()`
  - Emphasize: this pattern works with other providers and models too.

- **4. Live demo + Q&A (5–10 min)**
  - Run `npm run dev`
  - Ask the audience for prompts
  - Talk about extensions:
    - Tool use / function calling
    - Structured outputs (e.g., using Zod)
    - Swapping providers or models
    - Using the same primitives in other frameworks

---

## Summary

- The **AI SDK** is an open‑source toolkit for building AI features with good DX.
- This repo shows a **minimal but realistic Nuxt pattern**:
  - `@ai-sdk/vue` on the frontend
  - `ai` + `@ai-sdk/openai` on the backend
- Use this README as your **script/guide** for the talk and as a **starting point** for further experiments.
