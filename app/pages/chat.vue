<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { ref } from "vue";

// Reactive binding for the text input field
const input = ref("");

// Chat instance from @ai-sdk/vue, manages messages and communication
const chat = new Chat({});

// Handle the message form submission
const handleSubmit = (event: Event) => {
  // Prevent the browser from reloading the page on form submit
  event.preventDefault();
  // Send the current input value as a user message
  chat.sendMessage({ text: input.value });
  // Clear the input after sending the message
  input.value = "";
};
</script>


<template>
  <div class="min-h-screen flex flex-col max-w-4xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Chat</h1>
      <p class="text-gray-600">Ask me anything!</p>
    </div>

    <!-- Messages container -->
    <div class="flex-1 space-y-4 mb-6 overflow-y-auto">
      <div
        v-for="(message, messageIndex) in chat.messages"
        :key="message.id ? message.id : messageIndex"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-[80%] rounded-lg px-4 py-2',
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          ]"
        >
          <div class="text-xs font-semibold mb-1 opacity-75">
            {{ message.role === "user" ? "You" : "AI" }}
          </div>
          <div
            v-for="(messagePart, partIndex) in message.parts"
            :key="`${message.id}-${messagePart.type}-${partIndex}`"
          >
            <div v-if="messagePart.type === 'text'" class="whitespace-pre-wrap">
              {{ messagePart.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input form -->
    <form @submit="handleSubmit" class="flex gap-2">
      <input
        v-model="input"
        placeholder="Say something..."
        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        :disabled="!input.trim()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Send
      </button>
    </form>
  </div>
</template>