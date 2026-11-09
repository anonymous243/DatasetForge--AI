/**
 * Combinatorial Seed Matrix for Large-Scale AI Synthetic Generation
 *
 * Prevents LLM mode-collapse across thousands of rows by providing
 * orthogonal combinatorial axes: [Industry] x [Persona] x [MicroPolicy] x [ScenarioTwist]
 */

export interface CombinatorialAxisConfig {
  industries: string[];
  personas: string[];
  microPolicies: string[];
  conflictTwists: string[];
}

export const CORPORATE_SEED_MATRIX: CombinatorialAxisConfig = {
  industries: [
    "Offshore Wind Energy",
    "Clinical Genomics & Biotech",
    "High-Frequency Algorithmic Trading",
    "SaaS Cloud Infrastructure & DevOps",
    "Aerospace Defense Avionics",
    "Autonomous Fleet Logistics",
    "Pediatric Telehealth",
    "Semiconductor Fab Manufacturing",
    "Retail E-Commerce Warehousing",
    "Consumer FinTech & Neobanking",
    "Commercial Real Estate Asset Management",
    "Pharmaceutical Cold-Chain Supply",
    "Global Maritime Freight Shipping",
    "Green Hydrogen Energy Utilities",
    "Hospitality & Luxury Hotel Operations"
  ],
  personas: [
    "Junior Remote Contractor",
    "Chief Risk Officer (CRO)",
    "Senior Cloud DevOps Engineer",
    "Night-Shift Fulfillment Lead",
    "VP of Strategic Enterprise Sales",
    "Staff Firmware Architect",
    "Clinical Research Coordinator",
    "Third-Party Procurement Specialist",
    "In-House Compliance Counsel",
    "Principal Data Privacy Officer",
    "Field Maintenance Technician",
    "HR Talent Business Partner"
  ],
  microPolicies: [
    "Personal Cryptocurrency Trading & Disclosure Policy",
    "Unsanctioned Generative AI Tool Usage on Internal Codebases",
    "Vendor Gifting & Hospitality Thresholds ($50 cap)",
    "Cross-Border Data Transfer to Non-Adequacy Jurisdictions",
    "Moonlighting and Secondary Software Consulting",
    "Whistleblower Retaliation Protections & Confidential Channels",
    "Export Control Regulations & Dual-Use Technology",
    "Expense Reimbursement for Spousal / Family Travel",
    "Subpoena Response & Government Inquiries Protocol",
    "Off-the-Record Communications on Personal Messaging Apps",
    "IP Assignment for Inventions Created on Personal Laptops",
    "Emergency Production Rollback Authorization & Change Freeze"
  ],
  conflictTwists: [
    "Employee is under an active Performance Improvement Plan (PIP).",
    "Requested action is directly mandated by an executive VP verbally.",
    "Vendor threatened to cancel enterprise discount if gift is refused.",
    "Incident occurred during an active Sev-1 production outage.",
    "Conflicting regulations between EU GDPR and US federal subpoena.",
    "Employee claims fair-use under open-source permissive licensing.",
    "Immediate deal deadline is within 2 hours of quarter-end.",
    "Action was performed by an automated AI agent without human sign-off."
  ]
};

export const TTS_SEED_MATRIX: CombinatorialAxisConfig = {
  industries: [
    "Retail Telephony IVR",
    "Private Wealth Financial Advisory",
    "Emergency Public Safety Dispatch",
    "Clinical Lab Diagnostics Hotline",
    "Commercial Airline Priority Desk",
    "Executive Board Daily AI Podcast",
    "Cybersecurity Incident Audio Briefing",
    "E-Learning Technical STEM Narration"
  ],
  personas: [
    "Calm Crisis Navigator",
    "Authoritative Financial Anchor",
    "Warm Empathetic Tier-2 Specialist",
    "Fast-Paced Air Traffic Dispatcher",
    "Articulate Engineering Explainer",
    "Patient Healthcare Triage Assistant"
  ],
  microPolicies: [
    "Complex Currency Amounts and Decimal Calculations",
    "Alphanumeric Confirmation Codes, Routing & Account Digits",
    "Dates with Ordinals, Time Zones, and Operating Windows",
    "Acronyms vs Initialisms (e.g. SQL, NASDAQ, HIPAA, API)",
    "Technical Error Codes (e.g. HTTP 504, ERR_SSL_PROTOCOL)",
    "Prescription Dosages, Milligrams, and Frequency (e.g. 250mg BID)"
  ],
  conflictTwists: [
    "Requires frequent pauses (<break time='300ms'/>) to emphasize security numbers.",
    "Customer is panicked, requiring down-tempo soothing prosody.",
    "High information density with multiple statistics in one breath.",
    "Speech requires downward terminal inflection to convey absolute certainty."
  ]
};

/**
 * Returns a randomized or deterministic combinatorial prompt steering context
 */
export function generateSeedContext(datasetType: string, seedIndex?: number): string {
  const isTts = datasetType.includes('tts') || datasetType.includes('speech') || datasetType.includes('voice');
  const matrix = isTts ? TTS_SEED_MATRIX : CORPORATE_SEED_MATRIX;

  const idx = seedIndex !== undefined ? seedIndex : Math.floor(Math.random() * 100000);

  const ind = matrix.industries[idx % matrix.industries.length];
  const per = matrix.personas[(idx + 3) % matrix.personas.length];
  const pol = matrix.microPolicies[(idx + 7) % matrix.microPolicies.length];
  const twi = matrix.conflictTwists[(idx + 11) % matrix.conflictTwists.length];

  return `Domain Focus: ${ind} | Stakeholder Persona: ${per} | Subject Rule: ${pol} | Operational Constraint: ${twi}`;
}

