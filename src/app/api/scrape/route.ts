import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startRun }           from '@/lib/apify';
import { jobNameToApifyFilters, jobNameToApolloFilters } from '@/lib/ai';
import { searchApolloLeads } from '@/lib/apollo';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobName, maxLeads = 200, persona } = await request.json() as { jobName: string; maxLeads: number; persona: string };
    
    // Fetch user config from Supabase
    const { data: cfg } = await supabase.from('configs').select('*').eq('user_id', user.id).single();

    const apifyToken   = cfg?.apify_token   || process.env.APIFY_API_TOKEN   || '';
    const apolloKey    = cfg?.apollo_key    || process.env.APOLLO_API_KEY    || '';
    const anthropicKey = cfg?.anthropic_key || process.env.ANTHROPIC_API_KEY || '';
    const geminiKey    = cfg?.gemini_key    || process.env.GEMINI_API_KEY    || '';

    if (!apifyToken && !apolloKey) return NextResponse.json({ error: 'No scraping API token configured (Apify or Apollo)' }, { status: 400 });
    if (!anthropicKey && !geminiKey) return NextResponse.json({ error: 'No AI key configured (Anthropic or Gemini)' }, { status: 400 });

    const orderId = `JOB-${Date.now().toString().slice(-6)}`;

    // 1. If Apify is missing but Apollo is present, we run Apollo directly.
    if (!apifyToken && apolloKey) {
      const runId = `APOLLO-${Date.now()}`;
      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        user_id: user.id,
        job_name: jobName,
        date: new Date().toISOString().slice(0, 10),
        total_leads: 0,
        verified_emails: 0,
        status: 'running',
        leads: [],
        run_id: runId
      });
      if (insertError) throw insertError;

      const filters = await jobNameToApolloFilters(jobName, maxLeads, anthropicKey, geminiKey);
      const apolloLeads = await searchApolloLeads(filters, apolloKey);

      await supabase.from('orders').update({
         leads: apolloLeads,
         status: 'apollo_fetched' 
      }).eq('id', orderId);

      return NextResponse.json({ runId, orderId, status: 'running' }, { status: 201 });
    }

    // 2. Default to Apify
    const filters = await jobNameToApifyFilters(jobName, maxLeads, anthropicKey, geminiKey);
    const runId = await startRun(filters, apifyToken);

    const { error: insertError } = await supabase.from('orders').insert({
      id: orderId,
      user_id: user.id,
      job_name: jobName,
      date: new Date().toISOString().slice(0, 10),
      total_leads: 0,
      verified_emails: 0,
      status: 'running',
      leads: [],
      run_id: runId
    });

    if (insertError) throw insertError;

    return NextResponse.json({ runId, orderId, status: 'running' }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/scrape]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
