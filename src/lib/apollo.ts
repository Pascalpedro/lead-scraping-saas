import { ApolloInput } from './ai';

export interface ApolloLead {
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

export async function searchApolloLeads(input: ApolloInput, apiKey: string): Promise<ApolloLead[]> {
  const res = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      ...input,
    }),
  });

  if (!res.ok) {
    throw new Error(`Apollo search failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  
  if (!data.people || !Array.isArray(data.people)) {
    return [];
  }

  return data.people.map((person: any) => ({
    firstName: person.first_name,
    lastName: person.last_name,
    headline: person.title,
    organizationName: person.organization?.name,
    location: person.city ? `${person.city}, ${person.state || person.country}` : undefined,
    email: person.email,
    industry: person.organization?.primary_industry,
    linkedinUrl: person.linkedin_url,
    raw: person,
  }));
}
