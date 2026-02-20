'use server';
/**
 * @fileOverview A Genkit flow for generating a small, fake dataset in demo mode.
 *
 * - generateDemoDataset - A function that handles the demo dataset generation process.
 * - DemoDatasetInput - The input type for the generateDemoDataset function.
 * - DemoDatasetOutput - The return type for the generateDemoDataset function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DemoDatasetInputSchema = z
  .object({
    datasetType: z
      .string()
      .optional()
      .describe('The type of dataset requested for the demo.'),
  })
  .optional();
export type DemoDatasetInput = z.infer<typeof DemoDatasetInputSchema>;

const DemoDatasetOutputSchema = z
  .string()
  .describe('A JSON string representing the generated demo dataset.');
export type DemoDatasetOutput = z.infer<typeof DemoDatasetOutputSchema>;

export async function generateDemoDataset(
  input?: DemoDatasetInput
): Promise<DemoDatasetOutput> {
  return generateDemoDatasetFlow(input);
}

const generateDemoDatasetFlow = ai.defineFlow(
  {
    name: 'generateDemoDatasetFlow',
    inputSchema: DemoDatasetInputSchema,
    outputSchema: DemoDatasetOutputSchema,
  },
  async input => {
    // In demo mode, we return a hardcoded small, fake dataset.
    // The dataset type can optionally influence the content, but for simplicity,
    // we'll provide a generic demo dataset for now.
    const datasetType = input?.datasetType || 'generic';

    const demoData = [
      {
        id: 1,
        type: `${datasetType}_demo_item`,
        title: 'Demo Record 1',
        description: 'This is a sample record for demonstration purposes.',
        status: 'active',
      },
      {
        id: 2,
        type: `${datasetType}_demo_item`,
        title: 'Demo Record 2',
        description: 'Another example record to show application functionality.',
        status: 'inactive',
      },
      {
        id: 3,
        type: `${datasetType}_demo_item`,
        title: 'Demo Record 3',
        description: 'A third entry to give a sense of data structure.',
        status: 'active',
      },
    ];

    return JSON.stringify(demoData, null, 2);
  }
);
