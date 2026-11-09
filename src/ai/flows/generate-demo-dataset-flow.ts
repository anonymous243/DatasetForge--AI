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
    const rawType = (input?.datasetType || 'generic').toLowerCase().trim();

    if (rawType.includes('corporate_policy') || rawType.includes('compliance') || rawType.includes('dpo')) {
      const corporateDpoData = [
        {
          id: "corp-dpo-001",
          scenario_prompt: "Can I use an unapproved third-party cloud transcription service to summarize an internal executive roadmap meeting?",
          policy_domain: "Data Privacy & Security",
          relevant_policy_clause: "Information Security Policy Sec 4.3: Unsanctioned SaaS & Confidential Data Processing",
          reasoning: "The meeting contains sensitive internal roadmap information. Processing it through unvetted third-party cloud tools violates data sovereignty, confidentiality obligations, and risks IP exposure without vendor DPA protections.",
          chosen_response: "No. Company policy prohibits feeding non-public business discussions into unapproved third-party services. Please use our enterprise-licensed meeting assistant which is approved under our SOC 2 compliance guidelines, or submit a security review request via ServiceNow.",
          rejected_response: "Sure, as long as you delete the audio file from the website after you download the text transcript, it should be fine.",
          rejection_reason: "Violates security policy by sending confidential data to an unauthorized third-party vendor without an enterprise DPA or security certification.",
          risk_level: "critical"
        },
        {
          id: "corp-dpo-002",
          scenario_prompt: "A vendor sent me a $350 luxury watch as a holiday gift. Can I keep it since it was sent to my home address?",
          policy_domain: "Vendor & Anti-Bribery Ethics",
          relevant_policy_clause: "Global Anti-Corruption Code: Section 7 (Gifts, Hospitality, and Gratuities)",
          reasoning: "The gift value ($350) exceeds our allowable threshold ($50) and can create an actual or perceived conflict of interest during future contract tenders.",
          chosen_response: "No. Our Code of Conduct prohibits accepting gifts valued over $50 from existing or prospective vendors. Receiving it at your personal residence does not exempt it. You must report this to the Ethics Office and either return the item or surrender it for donation.",
          rejected_response: "Since it was delivered to your private home and not company headquarters, it falls under personal courtesy, so you can accept it without disclosing.",
          rejection_reason: "Violates anti-bribery policies and creates personal conflict of interest; location of delivery does not circumvent compliance rules.",
          risk_level: "high"
        },
        {
          id: "corp-dpo-003",
          scenario_prompt: "I am hosting a team dinner of 6 people while traveling for a client kickoff. Total expense is $420. Is VP approval required?",
          policy_domain: "Expense & Travel Policy",
          relevant_policy_clause: "Global Travel & Entertainment Policy: Section 3.2 (Group Meal Allowances)",
          reasoning: "Average per-person cost is $70, which is within the $85/person dinner travel cap for major metropolitan markets. Standard manager approval suffices.",
          chosen_response: "No VP approval is required. Because the dinner cost ($70 per person) is below the $85 per-person cap, this expense only requires standard direct manager approval. Remember to itemize the receipt and list all attendee names in Concur.",
          rejected_response: "Any expense above $400 requires immediate executive VP sign-off regardless of group size.",
          rejection_reason: "Misinterprets travel threshold limits by neglecting the per-attendee calculation, causing unnecessary bureaucratic bottlenecks.",
          risk_level: "low"
        }
      ];
      return JSON.stringify(corporateDpoData, null, 2);
    }

    if (rawType.includes('legal_contract') || rawType.includes('contract')) {
      const legalContractData = [
        {
          id: "legal-001",
          contract_type: "Master SaaS Subscription Agreement",
          clause_category: "Indemnification",
          original_clause: "Customer shall defend, indemnify, and hold harmless Vendor against any and all third-party claims, liabilities, damages, and costs arising out of Customer's use of the Service, without limitation.",
          risk_level: "unacceptable",
          identified_issues: [
            "Completely unilateral indemnification without reciprocal vendor IP infringement defense",
            "Lacks fault/negligence qualifier",
            "Exposes Customer to uncapped indemnity claims"
          ],
          suggested_redline: "Each party shall defend, indemnify, and hold harmless the other party against direct liabilities arising out of third-party intellectual property claims, subject to the Limitation of Liability section herein.",
          legal_justification: "Establishes standard mutual protection and ensures indemnification liability remains tethered to the agreed liability cap."
        },
        {
          id: "legal-002",
          contract_type: "Mutual Non-Disclosure Agreement",
          clause_category: "Confidentiality & Non-Disclosure",
          original_clause: "The obligations of confidentiality hereunder shall survive indefinitely from the Effective Date for all disclosed materials.",
          risk_level: "moderate_risk",
          identified_issues: [
            "Indefinite survival duration for standard business non-trade-secret information",
            "Creates indefinite compliance tracking liability"
          ],
          suggested_redline: "Confidentiality obligations shall survive for three (3) years from disclosure, provided that Trade Secrets shall remain protected for so long as they retain trade secret status under applicable law.",
          legal_justification: "Differentiates standard confidential commercial information (3 years) from permanent trade secrets."
        }
      ];
      return JSON.stringify(legalContractData, null, 2);
    }

    if (rawType.includes('tts') || rawType.includes('speech')) {
      const ttsData = [
        {
          id: "tts-voice-001",
          domain_category: "IVR Banking & Account Security",
          raw_text: "Your account balance is $14,250.80 as of 11/08/2026. A wire transfer of $3,500 was initiated at 4:45 PM.",
          spoken_normalized_text: "Your account balance is fourteen thousand two hundred fifty dollars and eighty cents as of November eighth, twenty twenty-six. A wire transfer of three thousand five hundred dollars was initiated at four forty-five P M.",
          speaker_style: "Articulate & Reassuring Financial Voicebot",
          target_emotion: "reassuring",
          speaking_rate_wpm: 145,
          ssml_tagged_text: "<speak>Your account balance is <emphasis level='moderate'>fourteen thousand two hundred fifty dollars and eighty cents</emphasis> as of November eighth, twenty twenty-six. <break time='400ms'/> A wire transfer of three thousand five hundred dollars was initiated at four forty-five P M.</speak>",
          phonetic_notes: [
            { term: "initiated", pronunciation: "/ɪˈnɪʃ.i.eɪ.tɪd/" },
            { term: "P M", pronunciation: "pee-em" }
          ]
        },
        {
          id: "tts-voice-002",
          domain_category: "Executive Daily AI Briefing",
          raw_text: "Q3 ARR rose 24.5% to $84.2M, beating guidance by 180 bps. CAC decreased by 12% across EMEA.",
          spoken_normalized_text: "Quarter three Annual Recurring Revenue rose twenty-four point five percent to eighty-four point two million dollars, beating guidance by one hundred eighty basis points. Customer Acquisition Cost decreased by twelve percent across E-M-E-A.",
          speaker_style: "Authoritative Anchor",
          target_emotion: "authoritative",
          speaking_rate_wpm: 155,
          ssml_tagged_text: "<speak><prosody rate='105%'>Quarter three Annual Recurring Revenue rose twenty-four point five percent to eighty-four point two million dollars</prosody>, beating guidance by <emphasis level='strong'>one hundred eighty basis points</emphasis>. <break time='300ms'/> Customer Acquisition Cost decreased by twelve percent across E-M-E-A.</speak>",
          phonetic_notes: [
            { term: "ARR", pronunciation: "A-R-R" },
            { term: "bps", pronunciation: "bips" },
            { term: "EMEA", pronunciation: "ee-mee-uh" }
          ]
        }
      ];
      return JSON.stringify(ttsData, null, 2);
    }

    if (rawType.includes('voice_agent') || rawType.includes('call_center')) {
      const voiceAgentData = [
        {
          id: "voice-agent-001",
          call_context: "Inbound customer inquiry regarding flight delay rebooking and meal voucher",
          customer_mood: "frustrated",
          dialogue_turns: [
            {
              turn_index: 1,
              speaker: "agent",
              text: "Thank you for calling SkyWays Priority Desk. My name is Alex. May I have your confirmation code?",
              tone_direction: "[calm and warm]",
              interruption: false,
              backchannel: false
            },
            {
              turn_index: 2,
              speaker: "customer",
              text: "My code is X7K9LP. Look, my flight to Chicago was just delayed by 4 hours and I have an essential meeting!",
              tone_direction: "[stressed, elevated pitch]",
              interruption: false,
              backchannel: false
            },
            {
              turn_index: 3,
              speaker: "agent",
              text: "I completely understand how critical your schedule is, Mr. Davis. I am pulling up direct alternatives right now.",
              tone_direction: "[empathetic, steady cadence]",
              interruption: false,
              backchannel: true
            },
            {
              turn_index: 4,
              speaker: "agent",
              text: "Good news: I can rebook you onto flight 412 departing at 6:15 PM which lands in Chicago by 8:30 PM. Would you like me to confirm this seat?",
              tone_direction: "[reassuring, clear]",
              interruption: false,
              backchannel: false
            }
          ],
          call_resolution: "Successfully transferred passenger to flight 412 and issued digital $30 meal voucher.",
          crm_summary: "Passenger was initially anxious due to schedule delay; resolved within 2 minutes with seamless rebooking."
        }
      ];
      return JSON.stringify(voiceAgentData, null, 2);
    }

    if (rawType.includes('it_incident') || rawType.includes('rca')) {
      const rcaData = [
        {
          id: "rca-001",
          incident_title: "PostgreSQL Connection Pool Exhaustion on Core Checkout Service",
          severity: "Sev-1",
          affected_systems: ["checkout-api", "pgbouncer-east", "payment-orchestrator"],
          symptoms_and_log_traces: "HTTP 500 error spike (28% failure rate); PgBouncer log: 'server conn crashed? (client_login_timeout)' with 1,200 waiting client connections.",
          root_cause_analysis: "A database migration script introduced an unindexed full table scan on the order_discounts table during Black Friday traffic, holding transactions open for 14s each and starving the shared connection pool.",
          immediate_mitigation: "Killed long-running queries via pg_terminate_backend and increased PgBouncer max_client_conn from 1000 to 2500.",
          permanent_preventative_actions: [
            "Added concurrent composite index on order_discounts(tenant_id, order_id)",
            "Implemented strict statement_timeout of 3000ms on all client connections",
            "Mandated automated query explain plan regression checks in CI pipeline"
          ],
          sla_breached: true
        }
      ];
      return JSON.stringify(rcaData, null, 2);
    }

    // Default fallback demo data
    const demoData = [
      {
        id: 1,
        type: `${rawType}_demo_item`,
        title: 'Demo Record 1',
        description: 'High-fidelity demonstration record for AI training and workflow evaluation.',
        status: 'active',
      },
      {
        id: 2,
        type: `${rawType}_demo_item`,
        title: 'Demo Record 2',
        description: 'Shows robust multi-attribute schema modeling and data fidelity.',
        status: 'completed',
      }
    ];

    return JSON.stringify(demoData, null, 2);
  }
);
