import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: config, error } = await supabase
    .from('configs')
    .select('apify_token, apollo_key, anthropic_key, gemini_key, anymailfinder_key, prospeo_key, system_prompt, user_prompt')
    .eq('user_id', user.id)
    .single();

  if (error || !config) {
    return NextResponse.json({ config: {} });
  }

  return NextResponse.json({
    config: {
      apifyToken: config.apify_token,
      apolloKey: config.apollo_key,
      anthropicKey: config.anthropic_key,
      geminiKey: config.gemini_key,
      anymailfinderKey: config.anymailfinder_key,
      prospeoKey: config.prospeo_key,
      systemPrompt: config.system_prompt,
      userPrompt: config.user_prompt
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incoming = await request.json();
    const updateData: Record<string, string> = {};

    const map: Record<string, string> = {
      apifyToken: 'apify_token',
      apolloKey: 'apollo_key',
      anthropicKey: 'anthropic_key',
      geminiKey: 'gemini_key',
      anymailfinderKey: 'anymailfinder_key',
      prospeoKey: 'prospeo_key',
      systemPrompt: 'system_prompt',
      userPrompt: 'user_prompt',
    };

    for (const [k, v] of Object.entries(incoming)) {
      if (v !== undefined && !String(v).startsWith('••')) {
        const dbKey = map[k];
        if (dbKey) {
          updateData[dbKey] = v as string;
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('configs')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
