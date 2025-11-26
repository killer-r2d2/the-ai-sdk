<script setup lang="ts">

/**
 * Shape of the structured data we expect back from the backend.
 * This mirrors the Zod schema in `server/api/invoice-extract.post.ts`.
 */
interface InvoiceExtractionResult {
  total: number;
  currency: string;
  invoiceNumber: string;
  companyAddress: string;
  companyName: string;
  invoiceeAddress: string;
}

// Currently selected PDF file from the file input
const selectedInvoiceFile = ref<File | null>(null);

// Indicates when a request is in flight so we can disable the button + show state
const isSubmitting = ref(false);

// Human‑readable error coming from either client‑side validation or the API
const extractionError = ref<string | null>(null);

// Structured result returned from the `/api/invoice-extract` endpoint
const extractionResult = ref<InvoiceExtractionResult | null>(null);

/**
 * Handle the user choosing a file from the `<input type="file" />`.
 * We enforce that the file is present and that it's a PDF.
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const fileList = target?.files;

  // Clear any previous error/result when the user picks a new file
  extractionError.value = null;
  extractionResult.value = null;

  if (!fileList || fileList.length === 0) {
    selectedInvoiceFile.value = null;
    return;
  }

  const candidateFile: File = fileList[0]!;

  // Basic MIME type check – keeps the example focused on PDFs only
  if (candidateFile.type !== "application/pdf") {
    extractionError.value = "Please upload a valid PDF file.";
    selectedInvoiceFile.value = null;
    return;
  }

  selectedInvoiceFile.value = candidateFile;
};

/**
 * Submit handler for the form.
 * Builds a `FormData` payload and POSTs it to `/api/invoice-extract`.
 */
const handleSubmit = async (event: Event) => {
  event.preventDefault();

  // Reset state so we always show fresh results/errors
  extractionError.value = null;
  extractionResult.value = null;

  if (!selectedInvoiceFile.value) {
    extractionError.value = "Please select a PDF invoice to upload.";
    return;
  }

  isSubmitting.value = true;

  try {
    // Build multipart/form-data body with the invoice file
    const formData = new FormData();
    formData.append("invoice", selectedInvoiceFile.value);

    // Call our Nitro API route
    const response = await fetch("/api/invoice-extract", {
      method: "POST",
      body: formData,
    });

    const responseBody = await response.json();

    // Handle HTTP‑level or app‑level (success flag) errors
    if (!response.ok || !responseBody.success) {
      const errorMessage =
        responseBody?.statusMessage ||
        responseBody?.error ||
        "Failed to extract data from the invoice.";
      extractionError.value = errorMessage;
      return;
    }

    // The backend already validated the shape using Zod; we just cast here
    extractionResult.value = responseBody.data as InvoiceExtractionResult;
  } catch (unknownError: any) {
    extractionError.value =
      unknownError?.message ??
      "An unexpected error occurred while extracting the invoice data.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen max-w-2xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Extract Structured Data From PDFs</h1>
      <p class="text-gray-600">
        Upload a PDF invoice and let the Vercel AI SDK extract structured fields
        like totals, currency, invoice number, and addresses.
      </p>
    </div>

    <!-- Upload + submit form -->
    <form @submit="handleSubmit" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <label class="block">
        <span class="block text-sm font-medium text-gray-700 mb-2">Invoice PDF:</span>
        <input
          type="file"
          accept="application/pdf"
          @change="handleFileChange"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </label>

      <button
        type="submit"
        :disabled="isSubmitting || !selectedInvoiceFile"
        class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isSubmitting ? "Analyzing invoice..." : "Extract data" }}
      </button>
    </form>

    <!-- Show any client / server error below the form -->
    <div
      v-if="extractionError"
      class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
    >
      {{ extractionError }}
    </div>

    <!-- Render the extracted structured object when available -->
    <div v-if="extractionResult" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Extraction result</h2>
      <dl class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Total:</dt>
          <dd class="text-gray-900 sm:w-2/3">{{ extractionResult.total }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Currency:</dt>
          <dd class="text-gray-900 sm:w-2/3">{{ extractionResult.currency }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Invoice number:</dt>
          <dd class="text-gray-900 sm:w-2/3">{{ extractionResult.invoiceNumber }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-start">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Company name:</dt>
          <dd class="text-gray-900 sm:w-2/3">{{ extractionResult.companyName }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-start">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Company address:</dt>
          <dd class="text-gray-900 sm:w-2/3 whitespace-pre-line">{{ extractionResult.companyAddress }}</dd>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-start">
          <dt class="font-semibold text-gray-700 sm:w-1/3">Invoicee address:</dt>
          <dd class="text-gray-900 sm:w-2/3 whitespace-pre-line">{{ extractionResult.invoiceeAddress }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>


