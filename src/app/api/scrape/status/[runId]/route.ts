import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRunStatus, getDatasetItems, ApifyLead } from '@/lib/apify';
import { generatePersonalisation, jobNameToApolloFilters }    from '@/lib/ai';
import { searchApolloLeads } from '@/lib/apollo';

interface Lead   { firstName: string; lastName: string; email: string; role?: string; company?: string; location?: string; personalization?: string; }

const DEFAULT_SYSTEM = 'You are a helpful, intelligent writing assistant.';
const DEFAULT_USER   = `Generate a one-line icebreaker. Return JSON: {"verdict":"true","icebreaker":"...","shortenedCompanyName":"..."}`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cfg } = await supabase.from('configs').select('*').eq('user_id', user.id).single();

    const apifyToken   = cfg?.apify_token   || process.env.APIFY_API_TOKEN   || '';
    const apolloKey    = cfg?.apollo_key    || process.env.APOLLO_API_KEY    || '';
    const anthropicKey = cfg?.anthropic_key || process.env.ANTHROPIC_API_KEY || '';
    const geminiKey    = cfg?.gemini_key    || process.env.GEMINI_API_KEY    || '';
    const systemPrompt = cfg?.system_prompt || DEFAULT_SYSTEM;
    const userPrompt   = cfg?.user_prompt   || DEFAULT_USER;

    // Fetch the order to get context (job_name, leads if Apollo already fetched)
    const { data: order } = await supabase.from('orders').select('*').eq('run_id', runId).eq('user_id', user.id).single();

    // ── 1. APOLLO PRIMARY LOGIC ──
    if (runId.startsWith('APOLLO-')) {
      if (order && order.status === 'apollo_fetched') {
        const rawLeads = order.leads || [];
        
        // Personalise each lead
        const leads: Lead[] = await Promise.all(
          rawLeads.map(async (l: any): Promise<Lead> => {
            const p = await generatePersonalisation(
              { firstName: l.firstName ?? '', lastName: l.lastName ?? '', headline: l.headline, industry: l.industry, organizationName: l.organizationName, location: l.location, email: l.email },
              systemPrompt, userPrompt, anthropicKey, geminiKey,
            );
            return {
              firstName: l.firstName ?? '', lastName: l.lastName ?? '',
              email: l.email ?? '', role: l.headline,
              company: p.shortenedCompanyName || l.organizationName,
              location: l.location, personalization: p.icebreaker,
            };
          })
        );

        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            total_leads: leads.length,
            verified_emails: leads.filter(l => l.email).length,
            leads: leads
          })
          .eq('run_id', runId)
          .eq('user_id', user.id)
          .select('id')
          .single();

        return NextResponse.json({ step: 3, orderId: updatedOrder?.id || null });
      } else if (order && order.status === 'completed') {
        return NextResponse.json({ step: 3, orderId: order.id });
      }
      return NextResponse.json({ step: 1, status: 'RUNNING' });
    }

    // ── 2. APIFY LOGIC (with Apollo Fallback) ──
    const { status, datasetId } = await getRunStatus(runId, apifyToken);

    const stepMap: Record<string, number> = { RUNNING: 0, READY: 0, SUCCEEDED: 2 };
    const step = stepMap[status] ?? 0;

    if (status === 'SUCCEEDED') {
      let rawLeads: any[] = await getDatasetItems(datasetId, apifyToken);

      // Detect Apify free-plan error
      if (rawLeads.length > 0 && rawLeads[0].error) {
        const apifyError = String(rawLeads[0].error);
        console.error('[Apify dataset error]', apifyError);
        
        // APOLLO FALLBACK
        if (apolloKey && order) {
          console.log('[Fallback] Triggering Apollo fallback for job:', order.job_name);
          try {
            const filters = await jobNameToApolloFilters(order.job_name, 200, anthropicKey, geminiKey);
            rawLeads = await searchApolloLeads(filters, apolloKey);
          } catch (apolloErr) {
            console.error('[Apollo fallback failed]', apolloErr);
            await supabase.from('orders').update({ status: 'failed' }).eq('run_id', runId).eq('user_id', user.id);
            return NextResponse.json({ error: `Apify failed: ${apifyError}. Apollo fallback also failed.` });
          }
        } else {
          await supabase.from('orders').update({ status: 'failed' }).eq('run_id', runId).eq('user_id', user.id);
          return NextResponse.json({
            error: apifyError.includes('free')
              ? 'Apify free plan does not allow API access. Upgrade Apify or configure an Apollo API key.'
              : `Apify error: ${apifyError}`,
          });
        }
      }

      const validLeads = rawLeads.filter(l => l.firstName || l.lastName || l.email);
      if (!validLeads.length) {
        return NextResponse.json({ error: '0 valid leads found. Try a broader job name.' });
      }

      // Personalise each lead
      const leads: Lead[] = await Promise.all(
        validLeads.map(async (l): Promise<Lead> => {
          const p = await generatePersonalisation(
            { firstName: l.firstName ?? '', lastName: l.lastName ?? '', headline: l.headline, industry: l.industry, organizationName: l.organizationName, location: l.location, email: l.email },
            systemPrompt, userPrompt, anthropicKey, geminiKey,
          );
          return {
            firstName: l.firstName ?? '', lastName: l.lastName ?? '',
            email: l.email ?? '', role: l.headline,
            company: p.shortenedCompanyName || l.organizationName,
            location: l.location, personalization: p.icebreaker,
          };
        })
      );

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          total_leads: leads.length,
          verified_emails: leads.filter(l => l.email).length,
          leads: leads
        })
        .eq('run_id', runId)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Order update error:', updateError);
      }

      return NextResponse.json({ step: 3, orderId: updatedOrder?.id || null });
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      return NextResponse.json({ error: `Apify run ${status.toLowerCase()}` });
    }

    return NextResponse.json({ step, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[GET /api/scrape/status]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
