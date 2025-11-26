import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
// @ts-ignore - pdf-parse types are provided via ambient declaration or runtime install
import pdfParse from 'pdf-parse';

/**
 * Zod schema that describes the structured invoice data we want to extract.
 * This is the same shape used on the frontend in `InvoiceExtractionResult`.
 */
const invoiceSchema = z
  .object({
    total: z.number().describe('The total amount of the invoice.'),
    currency: z.string().describe('The currency of the total amount.'),
    invoiceNumber: z.string().describe('The invoice number.'),
    companyAddress: z
      .string()
      .describe(
        'The address of the company or person issuing the invoice.',
      ),
    companyName: z
      .string()
      .describe('The name of the company issuing the invoice.'),
    invoiceeAddress: z
      .string()
      .describe(
        'The address of the company or person receiving the invoice.',
      ),
  })
  .describe('The extracted data from the invoice.');

/**
 * Nitro endpoint: POST /api/invoice-extract
 *
 * Expects a multipart/form-data request with a single file field named "invoice".
 * It parses the PDF, runs the Vercel AI SDK's `generateObject` with a Zod schema,
 * and returns the structured invoice data as JSON.
 */
export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event: any) => {
    // Parse a multipart/form-data request into fields/files
    const multipartFormData = await readMultipartFormData(event);

    if (!multipartFormData || multipartFormData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No form data received. Please upload a PDF invoice.',
      });
    }

    // Find the "invoice" file part uploaded by the client
    const uploadedInvoiceFileField = multipartFormData.find(
      (field) => field.name === 'invoice',
    );

    if (!uploadedInvoiceFileField || !uploadedInvoiceFileField.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing invoice file. Please upload a PDF invoice.',
      });
    }

    const invoiceBuffer = uploadedInvoiceFileField.data;

    try {
      // 1) Extract raw text content from the uploaded PDF using pdf-parse.
      //    This keeps the AI call simple (text-only prompt) and avoids
      //    dealing with file content parts in the prompt.
      const parsedPdf = await pdfParse(invoiceBuffer);
      const pdfTextContent = parsedPdf.text;

      // 2) Call generateObject with:
      //    - An OpenAI model bound via @ai-sdk/openai
      //    - A system prompt that explains the task
      //    - The Zod schema that enforces the output shape
      //    - The PDF text used as the main prompt
      const { object: extractionResult } = await generateObject({
        model: openai('gpt-5.1'),
        system:
          'You will receive the extracted text content of an invoice PDF. ' +
          'Using only this text, extract the structured data according to the provided schema.',
        schema: invoiceSchema,
        prompt: pdfTextContent,
      });

      // 3) Return a simple JSON envelope that the frontend can consume.
      return {
        success: true,
        data: extractionResult,
      };
    } catch (error: any) {
      // Surface any unexpected errors with a generic 500 + message
      throw createError({
        statusCode: 500,
        statusMessage:
          error?.message ??
          'Failed to extract data from the provided invoice PDF.',
      });
    }
  });
});


