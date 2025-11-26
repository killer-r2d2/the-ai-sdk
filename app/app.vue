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
<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>The AI SDK</h1>
    <div>
      <div
        v-for="(message, messageIndex) in chat.messages"
        :key="message.id ? message.id : messageIndex"
      >
        {{ message.role === "user" ? "User: " : "AI: " }}
        <div
          v-for="(messagePart, partIndex) in message.parts"
          :key="`${message.id}-${messagePart.type}-${partIndex}`"
        >
          <div v-if="messagePart.type === 'text'">{{ messagePart.text }}</div>
        </div>
      </div>

      <form @submit="handleSubmit">
        <input v-model="input" placeholder="Say something..." />
      </form>
    </div>
  </div>
</template>
