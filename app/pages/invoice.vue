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
  <!-- Simple centered layout; keep styles inline to avoid extra CSS files for the demo -->
  <div style="max-width: 640px; margin: 0 auto; padding: 1.5rem">
    <h1>Extract Structured Data From PDFs</h1>
    <p>
      Upload a PDF invoice and let the Vercel AI SDK extract structured fields
      like totals, currency, invoice number, and addresses.
    </p>

    <!-- Upload + submit form. Uses native form semantics with a custom submit handler. -->
    <form @submit="handleSubmit" style="margin-top: 1rem">
      <label>
        Invoice PDF:
        <input type="file" accept="application/pdf" @change="handleFileChange" />
      </label>

      <div style="margin-top: 0.75rem">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Analyzing invoice..." : "Extract data" }}
        </button>
      </div>
    </form>

    <!-- Show any client / server error below the form -->
    <p v-if="extractionError" style="margin-top: 1rem; color: red">
      {{ extractionError }}
    </p>

    <!-- Render the extracted structured object when available -->
    <div v-if="extractionResult" style="margin-top: 1.5rem">
      <h2>Extraction result</h2>
      <ul>
        <li><strong>Total:</strong> {{ extractionResult.total }}</li>
        <li><strong>Currency:</strong> {{ extractionResult.currency }}</li>
        <li><strong>Invoice number:</strong> {{ extractionResult.invoiceNumber }}</li>
        <li><strong>Company name:</strong> {{ extractionResult.companyName }}</li>
        <li><strong>Company address:</strong> {{ extractionResult.companyAddress }}</li>
        <li>
          <strong>Invoicee address:</strong>
          {{ extractionResult.invoiceeAddress }}
        </li>
      </ul>
    </div>
  </div>
</template>


