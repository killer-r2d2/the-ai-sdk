<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full space-y-8">
      <div class="text-center space-y-4">
        <h1 class="text-4xl font-bold text-gray-900">The AI SDK</h1>
        <p class="text-lg text-gray-600">Nuxt + Vercel AI SDK examples</p>
      </div>
      <ul class="space-y-4">
        <li>
          <NuxtLink
            to="/chat"
            class="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Chat</h2>
            <p class="text-gray-600">Interactive chat interface powered by AI</p>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/invoice"
            class="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
          >
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Extract Structured Data From PDFs</h2>
            <p class="text-gray-600">Upload PDF invoices and extract structured data</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>