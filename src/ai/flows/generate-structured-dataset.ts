'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating structured datasets.
 *
 * - generateStructuredDataset - A function that generates a dataset based on a predefined type or a custom JSON schema.
 * - GenerateStructuredDatasetInput - The input type for the generateStructuredDataset function.
 * - GenerateStructuredDatasetOutput - The return type for the generateStructuredDataset function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QaRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the QA pair.'),
  question: z.string().describe('A question related to a general topic.'),
  answer: z.string().describe('A concise and accurate answer to the question.'),
  category: z.string().optional().describe('An optional category for the QA pair.'),
});

const ClassificationRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the classification record.'),
  text: z.string().describe('The text content to be classified.'),
  label: z.string().describe('The classification label for the text.'),
});

const TextLabelRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the text labeling record.'),
  text: z.string().describe('The text content to be labeled.'),
  labels: z.array(z.string()).describe('A list of labels applicable to the text.'),
});

const CompanyRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the company record.'),
  companyName: z.string().describe('The name of the company.'),
  industry: z.string().describe('The industry the company operates in.'),
  employeeCount: z.number().int().min(1).describe('The number of employees.'),
  departments: z.array(z.string()).describe('List of departments within the company.'),
  headquarters: z.string().describe('The location of the company headquarters.'),
  foundingYear: z.number().int().min(1800).max(new Date().getFullYear()).describe('The year the company was founded.'),
  website: z.string().url().describe('The company\'s website URL.'),
});

const MedicalRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the medical record.'),
  patientName: z.string().describe('Full name of the patient.'),
  dateOfBirth: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).describe('Patient\'s date of birth in YYYY-MM-DD format.'),
  gender: z.enum(['Male', 'Female', 'Other']).describe('Patient\'s gender.'),
  diagnosis: z.string().describe('The primary medical diagnosis.'),
  symptoms: z.array(z.string()).describe('List of symptoms reported by the patient.'),
  treatment: z.string().describe('The recommended treatment plan.'),
  medications: z.array(z.string()).optional().describe('List of prescribed medications.'),
  dateOfVisit: z.string().datetime().describe('The date and time of the medical visit.'),
});

const SchoolRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the student record.'),
  studentName: z.string().describe('Full name of the student.'),
  gradeLevel: z.number().int().min(1).max(12).describe('Current grade level of the student.'),
  courses: z.array(z.object({
    courseName: z.string(),
    grade: z.string().max(2),
    teacher: z.string(),
  })).describe('List of courses with grades and teachers.'),
  enrollmentDate: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).describe('Student\'s enrollment date in YYYY-MM-DD format.'),
  gpa: z.number().min(0.0).max(4.0).optional().describe('Grade Point Average.'),
});

const MedicalDiagnosisRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the medical diagnosis record.'),
  patientId: z.string().uuid().describe('ID of the patient.'),
  symptoms: z.array(z.string()).describe('List of symptoms reported.'),
  testResults: z.string().describe('Summary of diagnostic test results.'),
  diagnosis: z.string().describe('The confirmed medical diagnosis.'),
  treatmentPlan: z.string().describe('Detailed treatment plan.'),
  severity: z.enum(['mild', 'moderate', 'severe']).describe('Severity of the condition.'),
  dateOfDiagnosis: z.string().datetime().describe('Date when the diagnosis was made.'),
});

// A generic record schema for 'records' type, can be more specific if needed.
const GenericRecordSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the record.'),
  data: z.record(z.any()).describe('Arbitrary key-value pairs representing the record data.'),
});

const predefinedSchemas = {
  qa: QaRecordSchema,
  classification: ClassificationRecordSchema,
  text_label: TextLabelRecordSchema,
  records: GenericRecordSchema, // Using generic for 'records'
  company: CompanyRecordSchema,
  medical: MedicalRecordSchema,
  school: SchoolRecordSchema,
  medical_diagnosis: MedicalDiagnosisRecordSchema,
};

const datasetTypeEnum = z.enum([
  'qa',
  'classification',
  'text_label',
  'records',
  'company',
  'medical',
  'school',
  'medical_diagnosis',
]);

const GenerateStructuredDatasetInputSchema = z.object({
  datasetType: datasetTypeEnum.optional().describe('The type of dataset to generate.'),
  customSchema: z.string().optional().describe('An optional custom JSON schema string. If provided, overrides datasetType.'),
  numRecords: z.number().int().min(1).max(50).default(5).describe('The number of records to generate in the dataset.'),
  description: z.string().optional().describe('Additional description or specific requirements for data generation.'),
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
    const { datasetType, customSchema, numRecords, description } = input;
    let schemaToUse: z.AnyZodObject;

    if (customSchema) {
      try {
        schemaToUse = z.object(JSON.parse(customSchema));
      } catch (e) {
        throw new Error(`Invalid custom schema provided: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else if (datasetType) {
      const selectedSchema = predefinedSchemas[datasetType];
      if (!selectedSchema) {
        throw new Error(`Unknown dataset type: ${datasetType}`);
      }
      schemaToUse = selectedSchema;
    } else {
      throw new Error('Either datasetType or customSchema must be provided.');
    }

    const fullSchema = z.array(schemaToUse);
    const schemaString = JSON.stringify(fullSchema.openapi());

    const promptTemplate = ai.definePrompt({
      name: 'datasetGenerationPrompt',
      input: { schema: z.object({
        numRecords: z.number(),
        schemaString: z.string(),
        description: z.string().optional()
      })},
      output: { schema: z.object({ generatedData: z.string() }) },
      prompt: `You are an expert data generator AI. Your task is to generate realistic structured data based on a provided JSON schema.

Instructions:
- Generate exactly {{numRecords}} records.
- Ensure the output strictly adheres to the provided JSON schema.
- The entire output MUST be a valid JSON array conforming to the schema.
- Do NOT include any conversational text, explanations, or markdown outside the JSON.
- Make the data as realistic and diverse as possible, respecting the schema field descriptions.

JSON Schema:
${schemaString}

{{#if description}}
Additional context/requirements: {{description}}
{{/if}}

Generated JSON array:`,
    });

    let retries = 3;
    let generatedDataString = '';

    while (retries > 0) {
      try {
        const { output } = await promptTemplate({
          numRecords,
          schemaString,
          description,
        });

        if (!output || !output.generatedData) {
          throw new Error('LLM did not return generatedData.');
        }

        // Attempt to parse and validate the JSON output against the Zod schema.
        const parsedData = JSON.parse(output.generatedData);
        fullSchema.parse(parsedData); // This will throw if validation fails
        generatedDataString = output.generatedData;
        break; // Successfully generated and validated, exit retry loop
      } catch (e) {
        console.error(`Attempt failed: ${e instanceof Error ? e.message : String(e)}`);
        retries--;
        if (retries === 0) {
          throw new Error(`Failed to generate valid JSON data after multiple retries: ${e instanceof Error ? e.message : String(e)}`);
        }
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { generatedData: generatedDataString };
  }
);
