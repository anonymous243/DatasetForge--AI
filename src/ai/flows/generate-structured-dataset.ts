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
import { generateDemoDataset } from './generate-demo-dataset-flow';
import { cleanAndDeduplicateDataset, HygieneStats } from '@/lib/data-cleaner';
import { generateSeedContext } from '@/lib/seed-matrix';

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

// Corporate & Enterprise AI Training Schemas
const CorporatePolicyDpoSchema = z.object({
  id: z.string(),
  scenario_prompt: z.string().describe('Workplace scenario or employee query regarding company policy'),
  policy_domain: z.enum([
    'HR & Workplace Conduct',
    'Data Privacy & Security',
    'Expense & Travel Policy',
    'Intellectual Property & Confidentiality',
    'Vendor & Anti-Bribery Ethics',
    'Whistleblower & Regulatory Compliance'
  ]),
  relevant_policy_clause: z.string().describe('Standard handbook section or clause reference'),
  reasoning: z.string().describe('Chain of thought breaking down constraints and compliance risks'),
  chosen_response: z.string().describe('Compliant, professional, grounded resolution adhering strictly to policy'),
  rejected_response: z.string().describe('Plausible but non-compliant, loose, or unauthorized response'),
  rejection_reason: z.string().describe('Exact reason why the rejected response violates enterprise compliance'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
});

const LegalContractAnalysisSchema = z.object({
  id: z.string(),
  contract_type: z.string().describe('Type of contract e.g. SaaS Agreement, NDA, Master Services Agreement'),
  clause_category: z.enum([
    'Indemnification',
    'Limitation of Liability',
    'Intellectual Property Ownership',
    'Confidentiality & Non-Disclosure',
    'Termination & Breach',
    'Governing Law & Jurisdiction',
    'Data Security & Audit Rights'
  ]),
  original_clause: z.string().describe('The contractual clause under review'),
  risk_level: z.enum(['acceptable', 'moderate_risk', 'high_risk', 'unacceptable']),
  identified_issues: z.array(z.string()).describe('Specific one-sided, ambiguous, or risky provisions'),
  suggested_redline: z.string().describe('Balanced, market-standard redline revision of the clause'),
  legal_justification: z.string().describe('Legal and business rationale for the proposed redline'),
});

const ItIncidentRcaSchema = z.object({
  id: z.string(),
  incident_title: z.string(),
  severity: z.enum(['Sev-1', 'Sev-2', 'Sev-3', 'Sev-4']),
  affected_systems: z.array(z.string()),
  symptoms_and_log_traces: z.string().describe('Key log excerpts, error codes, and telemetry anomalies'),
  root_cause_analysis: z.string().describe('Deep technical explanation of the failure mechanism'),
  immediate_mitigation: z.string().describe('Actions taken to restore service immediately'),
  permanent_preventative_actions: z.array(z.string()).describe('Engineering backlog fixes to prevent recurrence'),
  sla_breached: z.boolean(),
});

const B2bSalesDialogueSchema = z.object({
  id: z.string(),
  industry: z.string(),
  prospect_role: z.string(),
  objection_type: z.enum(['pricing', 'competitor', 'security_compliance', 'timing_budget', 'feature_gap']),
  prospect_objection: z.string(),
  rep_reasoning: z.string().describe('Sales methodology strategy (e.g. MEDDPICC, Challenger)'),
  winning_rep_response: z.string(),
  call_to_action: z.string(),
  deal_stage: z.string(),
});

// Voice & Speech AI Training Schemas
const TtsSpeechDatasetSchema = z.object({
  id: z.string(),
  domain_category: z.string().describe('e.g. IVR Banking, Executive Briefing, Customer Support, Audiobook'),
  raw_text: z.string().describe('Text with numerals, symbols, currency, abbreviations ($150.25, 04/12/24, Dr., etc.)'),
  spoken_normalized_text: z.string().describe('Fully verbalized and expanded text as spoken by a native human speaker'),
  speaker_style: z.string().describe('e.g. Empathetic Support, Authoritative Anchor, Conversational Assistant'),
  target_emotion: z.enum(['neutral', 'empathetic', 'authoritative', 'reassuring', 'urgent', 'enthusiastic']),
  speaking_rate_wpm: z.number().int().describe('Target words per minute e.g. 130-160'),
  ssml_tagged_text: z.string().describe('Script with SSML tags (<break>, <emphasis>, <prosody>)'),
  phonetic_notes: z.array(z.object({
    term: z.string(),
    pronunciation: z.string().describe('Phonetic respelling or IPA representation'),
  })).optional(),
});

const VoiceAgentDialogueSchema = z.object({
  id: z.string(),
  call_context: z.string().describe('Context and goal of the voice agent call'),
  customer_mood: z.enum(['frustrated', 'confused', 'hurried', 'neutral', 'satisfied']),
  dialogue_turns: z.array(z.object({
    turn_index: z.number().int(),
    speaker: z.enum(['agent', 'customer']),
    text: z.string(),
    tone_direction: z.string().describe('e.g. [calm], [sighs], [friendly], [firm]'),
    interruption: z.boolean(),
    backchannel: z.boolean(),
  })),
  call_resolution: z.string(),
  crm_summary: z.string(),
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
  // Corporate & Enterprise AI
  corporate_policy_dpo: CorporatePolicyDpoSchema,
  legal_contract_analysis: LegalContractAnalysisSchema,
  it_incident_rca: ItIncidentRcaSchema,
  b2b_sales_dialogue: B2bSalesDialogueSchema,
  // Voice & Speech AI
  tts_speech_dataset: TtsSpeechDatasetSchema,
  voice_agent_dialogue: VoiceAgentDialogueSchema,
};

const GenerateStructuredDatasetInputSchema = z.object({
  datasetType: z.string().describe('The name or type of dataset to generate.'),
  numRecords: z.number().int().min(1).max(50).default(5).describe('The number of records to generate.'),
  description: z.string().optional().describe('Additional context for data generation.'),
});

export type GenerateStructuredDatasetInput = z.infer<typeof GenerateStructuredDatasetInputSchema>;

const GenerateStructuredDatasetOutputSchema = z.object({
  generatedData: z.string().describe('The generated dataset as a JSON string.'),
  hygieneStats: z.object({
    totalInput: z.number(),
    totalOutput: z.number(),
    exactDuplicatesRemoved: z.number(),
    nearDuplicatesRemoved: z.number(),
    hygieneFixesApplied: z.number(),
    uniquenessScorePct: z.number(),
  }).optional(),
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
    const typeKey = datasetType.toLowerCase().trim();

    // Over-generation buffer (1.3x) to ensure full requested count after strict deduplication
    const targetBuffer = Math.min(50, Math.ceil(numRecords * 1.3));
    const recordSchema = predefinedSchemas[typeKey] || z.record(z.any());
    const seedGuidance = generateSeedContext(datasetType);
    
    let rawRecords: any[] = [];

    try {
      const { output } = await ai.generate({
        output: { schema: z.array(recordSchema) },
        prompt: `You are an elite, open-source synthetic data generator specialized in enterprise and AI model training datasets.
Generate exactly ${targetBuffer} realistic, high-fidelity, strictly unique records for a dataset of type: "${datasetType}".
${description ? `Context/Domain Requirements: ${description}` : ''}
Combinatorial Steering Vector: ${seedGuidance}

Strict Quality & Hygiene Directives:
1. Complete Uniqueness: Never generate duplicate prompts, scenarios, or clauses. Every record must explore a completely distinct entity, situation, and numerical constraint.
2. Enterprise Realism: Use authentic, nuanced business scenarios, avoiding repetitive or clichéd placeholder names (no 'Acme Corp' or 'John Doe').
3. Precision: If generating DPO pairs, ensure the chosen response strictly follows corporate policies while the rejected response illustrates a realistic compliance pitfall.
4. Audio/TTS Accuracy: If generating speech/TTS datasets, provide accurate text normalization (expanding dates, currency, numbers, and acronyms verbatim) alongside natural SSML markup.
5. Punctuation & Formatting: Ensure every sentence is complete, with terminal punctuation. Do not truncate.`,
        config: {
          temperature: 0.8,
        },
      });

      if (!output || !Array.isArray(output) || output.length === 0) {
        throw new Error('AI returned an empty response.');
      }
      rawRecords = output;
    } catch (error: any) {
      console.warn('AI generation unavailable or failed, generating high-fidelity demo dataset:', error?.message);
      // Seamless fallback to high-fidelity demo generation so users are never blocked
      const demoResult = await generateDemoDataset({ datasetType });
      try {
        rawRecords = JSON.parse(demoResult);
      } catch {
        rawRecords = [];
      }
    }

    // Pass through the comprehensive Hygiene, Sanitization & Deduplication Engine
    const { cleanedRecords, stats } = cleanAndDeduplicateDataset(rawRecords, datasetType, 0.65);

    // Slice to the user's requested count (or maximum pristine available)
    const finalRecords = cleanedRecords.slice(0, numRecords);
    stats.totalOutput = finalRecords.length;

    return { 
      generatedData: JSON.stringify(finalRecords, null, 2),
      hygieneStats: stats
    };
  }
);
