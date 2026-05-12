const ACTOR_ID = 'code_crafter~leads-finder';
const BASE     = 'https://api.apify.com/v2';

export interface ApifyInput {
  company_industry?:  string[];
  company_keywords?:  string[];
  contact_job_title?: string[];
  contact_location?:  string[];
  email_status?:      string[];
  fetch_count?:       number;
  file_name?:         string;
  functional_level?:  string[];
  seniority_level?:   string[];
  size?:              string[];
}

export interface ApifyLead {
  firstName?:        string;
  lastName?:         string;
  headline?:         string;
  organizationName?: string;
  location?:         string;
  email?:            string;
  industry?:         string;
  linkedinUrl?:      string;
  [key: string]:     unknown;
}

export async function startRun(input: ApifyInput, token: string): Promise<string> {
  const res = await fetch(`${BASE}/acts/${ACTOR_ID}/runs?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify start failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.id as string;
}

export async function getRunStatus(runId: string, token: string): Promise<{ status: string; datasetId: string }> {
  const res = await fetch(`${BASE}/actor-runs/${runId}?token=${token}`);
  if (!res.ok) throw new Error(`Apify status failed: ${res.status}`);
  const data = await res.json();
  return { status: data.data.status, datasetId: data.data.defaultDatasetId };
}

export async function getDatasetItems(datasetId: string, token: string): Promise<ApifyLead[]> {
  const res = await fetch(`${BASE}/datasets/${datasetId}/items?token=${token}&clean=true`);
  if (!res.ok) throw new Error(`Apify dataset failed: ${res.status}`);
  return res.json();
}
