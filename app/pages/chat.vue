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
  <div>
    <h1>Chat</h1>
    <p>
      Model: Anthropic Claude 3.7 Sonnet
    </p>
      <!-- Render each chat message -->
      <div
        v-for="(message, messageIndex) in chat.messages"
        :key="message.id ? message.id : messageIndex"
      >
        <!-- Show who sent the message: User or AI -->
        {{ message.role === "user" ? "User: " : "AI: " }}
        <div
          v-for="(messagePart, partIndex) in message.parts"
          :key="`${message.id}-${messagePart.type}-${partIndex}`"
        >
          <!-- Only render text parts for now -->
          <div v-if="messagePart.type === 'text'">{{ messagePart.text }}</div>
        </div>
      </div>

      <!-- Simple form to send a new message -->
      <form @submit="handleSubmit">
        <input v-model="input" placeholder="Say something..." />
      </form>
    </div>
</template>