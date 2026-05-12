import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApifyInput } from './apify';

// ── Provider selection ─────────────────────────────────────────────────────
// Priority: Anthropic → Gemini
export function pickAIProvider(anthropicKey?: string, geminiKey?: string): 'anthropic' | 'gemini' | null {
  if (anthropicKey) return 'anthropic';
  if (geminiKey)    return 'gemini';
  return null;
}

// ── Core AI call ──────────────────────────────────────────────────────────
async function callAI(
  system: string,
  user: string,
  anthropicKey?: string,
  geminiKey?: string,
): Promise<string> {
  const provider = pickAIProvider(anthropicKey, geminiKey);
  if (!provider) throw new Error('No AI API key configured. Add Anthropic or Gemini key in /config.');

  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey: anthropicKey });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
    });
    return (msg.content[0] as { text: string }).text;
  }

  // Gemini fallback
  const genAI = new GoogleGenerativeAI(geminiKey!);
  const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  try {
    const result = await model.generateContent(`${system}\n\n${user}`);
    return result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      throw new Error(
        'Gemini API quota exhausted (free tier). Options:\n' +
        '1. Add your Anthropic API key in /config (recommended)\n' +
        '2. Enable billing on your Google AI Studio project'
      );
    }
    throw err;
  }
}

// ── Convert job name → Apify filters ─────────────────────────────────────
const APIFY_FILTER_SYSTEM = `You are a B2B lead generation expert. Given a natural-language search query, output a JSON object of Apify leads-finder filters. Return ONLY valid JSON, no markdown fences.

Available fields:
- company_industry: string[] — e.g. ["information technology & services","internet","financial services","marketing and advertising"]
- company_keywords: string[]
- contact_job_title: string[]
- contact_location: string[] — country or city names, lowercase
- email_status: always ["validated"]
- functional_level: string[] — subset of: ["c_suite", "finance", "product_management", "engineering", "design", "education", "human_resources", "information_technology", "legal", "marketing", "operations", "sales", "support"]
- seniority_level: string[] — subset of: ["founder","owner","c_level","partner","vp","director","manager","senior","entry"]
- size: string[] — subset of: ["1-10","11-20","21-50","51-100","101-200","201-500","501-1000","1001-5000"]`;

export async function jobNameToApifyFilters(
  jobName: string,
  maxLeads: number,
  anthropicKey?: string,
  geminiKey?: string,
): Promise<ApifyInput> {
  const raw     = await callAI(APIFY_FILTER_SYSTEM, `Search query: "${jobName}"\nMax leads: ${maxLeads}`, anthropicKey, geminiKey);
  const json    = raw.replace(/```json|```/g, '').trim();
  const filters = JSON.parse(json) as ApifyInput;
  return { ...filters, email_status: ['validated'], fetch_count: maxLeads, file_name: jobName };
}

// ── Convert job name → Apollo filters ─────────────────────────────────────
export interface ApolloInput {
  person_titles?: string[];
  person_locations?: string[];
  organization_industry_tag_ids?: string[];
  organization_num_employees_ranges?: string[];
  q_keywords?: string;
  per_page?: number;
}

const APOLLO_FILTER_SYSTEM = `You are a B2B lead generation expert. Given a natural-language search query, output a JSON object of Apollo.io search filters. Return ONLY valid JSON, no markdown fences.

Available fields:
- person_titles: string[] — e.g. ["CEO", "Founder", "Marketing Manager"]
- person_locations: string[] — e.g. ["United States", "London"]
- organization_industry_tag_ids: string[] — e.g. ["information_technology_and_services", "internet"] (use lowercase with underscores)
- organization_num_employees_ranges: string[] — e.g. ["1,10", "11,20", "21,50", "51,100", "101,200", "201,500"]
- q_keywords: string — a single general keyword search string`;

export async function jobNameToApolloFilters(
  jobName: string,
  maxLeads: number,
  anthropicKey?: string,
  geminiKey?: string,
): Promise<ApolloInput> {
  const raw     = await callAI(APOLLO_FILTER_SYSTEM, `Search query: "${jobName}"`, anthropicKey, geminiKey);
  const json    = raw.replace(/```json|```/g, '').trim();
  const filters = JSON.parse(json) as ApolloInput;
  return { ...filters, per_page: Math.min(maxLeads, 100) };
}

// ── Personalisation ───────────────────────────────────────────────────────
export interface PersonalisationInput {
  firstName:         string;
  lastName:          string;
  headline?:         string;
  industry?:         string;
  organizationName?: string;
  location?:         string;
  email?:            string;
}

export interface PersonalisationResult {
  verdict:              string;
  icebreaker:           string;
  shortenedCompanyName: string;
}

export async function generatePersonalisation(
  lead: PersonalisationInput,
  systemPrompt: string,
  userPromptTemplate: string,
  anthropicKey?: string,
  geminiKey?: string,
): Promise<PersonalisationResult> {
  const userMsg = `${userPromptTemplate}\n\nInput: ${lead.firstName}, ${lead.lastName}, ${lead.headline ?? ''}, ${lead.industry ?? ''}, ${lead.organizationName ?? ''}, ${lead.location ?? ''}, ${lead.email ?? ''}`;
  try {
    const raw  = await callAI(systemPrompt, userMsg, anthropicKey, geminiKey);
    const json = raw.replace(/```json|```/g, '').trim();
    // Handle both {"...":"..."} and ({...}) formats
    const clean = json.replace(/^\(/, '').replace(/\)$/, '');
    return JSON.parse(clean) as PersonalisationResult;
  } catch {
    return {
      verdict: 'true',
      icebreaker: `Hey ${lead.firstName}, wanted to run something by you.`,
      shortenedCompanyName: lead.organizationName ?? '',
    };
  }
}
