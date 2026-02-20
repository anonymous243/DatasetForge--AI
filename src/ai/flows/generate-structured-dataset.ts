'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating structured datasets.
 *
 * - generateStructuredDataset - A function that generates a dataset based on a predefined type or custom category.
 * - GenerateStructuredDatasetInput - The input type for the generateStructuredDataset function.
 * - GenerateStructuredDatasetOutput - The return type for the generateStructuredDataset function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QaRecordSchema = z.object({
  id: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});

const ClassificationRecordSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  label: z.string(),
});

const TextLabelRecordSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  labels: z.array(z.string()),
});

const CompanyRecordSchema = z.object({
  id: z.string().uuid(),
  companyName: z.string(),
  industry: z.string(),
  employeeCount: z.number().int(),
  departments: z.array(z.string()),
  headquarters: z.string(),
  foundingYear: z.number().int(),
  website: z.string().url(),
});

const MedicalRecordSchema = z.object({
  id: z.string().uuid(),
  patientName: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  diagnosis: z.string(),
  symptoms: z.array(z.string()),
  treatment: z.string(),
  medications: z.array(z.string()).optional(),
  dateOfVisit: z.string(),
});

const SchoolRecordSchema = z.object({
  id: z.string().uuid(),
  studentName: z.string(),
  gradeLevel: z.number().int(),
  courses: z.array(z.object({
    courseName: z.string(),
    grade: z.string(),
    teacher: z.string(),
  })),
  enrollmentDate: z.string(),
  gpa: z.number().optional(),
});

const MedicalDiagnosisRecordSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  symptoms: z.array(z.string()),
  testResults: z.string(),
  diagnosis: z.string(),
  treatmentPlan: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  dateOfDiagnosis: z.string(),
});

const CustomerReviewSchema = z.object({
  id: z.string().uuid(),
  productName: z.string(),
  reviewerName: z.string(),
  rating: z.number(),
  reviewText: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  isVerifiedPurchase: z.boolean(),
});

const ProductInventorySchema = z.object({
  id: z.string().uuid(),
  sku: z.string(),
  productName: z.string(),
  category: z.string(),
  price: z.number(),
  stockQuantity: z.number().int(),
  supplier: z.string(),
  lastRestocked: z.string(),
});

const SupportTicketSchema = z.object({
  id: z.string().uuid(),
  subject: z.string(),
  description: z.string(),
  status: z.enum(['open', 'pending', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  customerEmail: z.string().email(),
  assignedAgent: z.string(),
  createdAt: z.string(),
});

const RealEstateSchema = z.object({
  id: z.string().uuid(),
  address: z.string(),
  propertyType: z.enum(['house', 'apartment', 'condo', 'townhouse']),
  price: z.number(),
  bedrooms: z.number().int(),
  bathrooms: z.number(),
  squareFeet: z.number(),
  listingStatus: z.enum(['active', 'pending', 'sold']),
  amenities: z.array(z.string()),
});

const GenericRecordSchema = z.object({
  id: z.string().uuid(),
  data: z.record(z.any()),
});

const predefinedSchemas: Record<string, z.ZodObject<any>> = {
  qa: QaRecordSchema,
  classification: ClassificationRecordSchema,
  text_label: TextLabelRecordSchema,
  records: GenericRecordSchema,
  company: CompanyRecordSchema,
  medical: MedicalRecordSchema,
  school: SchoolRecordSchema,
  medical_diagnosis: MedicalDiagnosisRecordSchema,
  customer_review: CustomerReviewSchema,
  product_inventory: ProductInventorySchema,
  support_ticket: SupportTicketSchema,
  real_estate: RealEstateSchema,
};

const GenerateStructuredDatasetInputSchema = z.object({
  datasetType: z.string().describe('The name or type of dataset to generate.'),
  numRecords: z.number().int().min(1).max(50).default(5).describe('The number of records to generate.'),
  description: z.string().optional().describe('Additional context for data generation.'),
});

export type GenerateStructuredDatasetInput = z.infer<typeof GenerateStructuredDatasetInputSchema>;

const GenerateStructuredDatasetOutputSchema = z.object({
  generatedData: z.string().describe('The generated dataset as a JSON string.'),
});

export type GenerateStructuredDatasetOutput = z.infer<typeof GenerateStructuredDatasetOutputSchema>;

export async function generateStructuredDataset(
  input: GenerateStructuredDatasetInput
): Promise<GenerateStructuredDatasetOutput> {
  return generateStructuredDatasetFlow(input);
}

const generateStructuredDatasetFlow = ai.defineFlow(
  {
    name: 'generateStructuredDatasetFlow',
    inputSchema: GenerateStructuredDatasetInputSchema,
    outputSchema: GenerateStructuredDatasetOutputSchema,
  },
  async (input) => {
    const { datasetType, numRecords, description } = input;

    // Use predefined schema if available, otherwise use a generic array of objects
    const recordSchema = predefinedSchemas[datasetType.toLowerCase()] || z.record(z.any());
    
    const { output } = await ai.generate({
      output: { schema: z.array(recordSchema) },
      prompt: `You are a high-speed synthetic data generator. 
               Generate exactly ${numRecords} realistic, high-fidelity records for a dataset of type: "${datasetType}".
               ${description ? `Context/Requirements: ${description}` : ''}
               Ensure every record is unique and realistic.`,
      config: {
        temperature: 0.7, // Lower temperature slightly for speed and consistency
      },
    });

    if (!output) throw new Error('Generation failed. Please try again.');
    
    return { generatedData: JSON.stringify(output, null, 2) };
  }
);
