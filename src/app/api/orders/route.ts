import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, job_name, date, total_leads, verified_emails, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedOrders = orders?.map(o => ({
    id: o.id,
    jobName: o.job_name,
    date: o.date,
    totalLeads: o.total_leads,
    verifiedEmails: o.verified_emails,
    status: o.status
  })) ?? [];

  return NextResponse.json({ orders: formattedOrders });
}
