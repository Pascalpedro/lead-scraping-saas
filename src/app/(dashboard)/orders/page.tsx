'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './Orders.module.css';

interface Lead {
  firstName: string; lastName: string; email: string;
  role?: string; personalization?: string;
}
interface Order {
  id: string; jobName: string; date: string;
  totalLeads: number; verifiedEmails: number;
  status: 'completed' | 'running' | 'failed';
  leads?: Lead[];
}

const MOCK_ORDERS: Order[] = [
  { id: 'JOB-8923', jobName: 'VP Sales – SaaS – US',         date: '2026-02-24', totalLeads: 450,  verifiedEmails: 412, status: 'completed' },
  { id: 'JOB-8922', jobName: 'Marketing Directors UK',        date: '2026-02-23', totalLeads: 1200, verifiedEmails: 980, status: 'completed' },
  { id: 'JOB-8921', jobName: 'YCombinator Founders S24',      date: '2026-02-21', totalLeads: 156,  verifiedEmails: 134, status: 'completed' },
  { id: 'JOB-8920', jobName: 'Local Plumbers in NY',          date: '2026-02-15', totalLeads: 80,   verifiedEmails: 65,  status: 'completed' },
];


function exportCSV(order: Order, leads: Lead[]) {
  const headers = ['First Name','Last Name','Email','Role','Personalization'];
  const rows = leads.map(l =>
    [l.firstName,l.lastName,l.email,l.role??'',l.personalization??'']
      .map(v => `"${String(v).replace(/"/g,'""')}"`)
      .join(',')
  );
  const csv  = [headers.join(','),...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${order.id}-leads.csv`; a.click();
  URL.revokeObjectURL(url);
}

// Always fetches fresh data from the API before exporting
async function fetchAndExport(order: Order) {
  try {
    const res  = await fetch(`/api/orders/${order.id}`);
    const data = await res.json();
    const leads: Lead[] = data.leads ?? [];
    if (!leads.length) { alert('No leads found for this order yet.'); return; }
    exportCSV(order, leads);
  } catch {
    alert('Failed to fetch leads. Please try again.');
  }
}

// ── SVG icon helpers ──────────────────────────────────────────────────────
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IconDots = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>(MOCK_ORDERS);
  const [selected, setSelected]       = useState<Order | null>(null);
  const [drawerLeads, setDrawerLeads] = useState<Lead[]>([]);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => { if (d.orders?.length) setOrders(d.orders); }).catch(() => {});
  }, []);

  const openDrawer = async (order: Order) => {
    setSelected(order);
    setDrawerLeads([]); // clear while loading
    try {
      const res  = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      setDrawerLeads(data.leads ?? []);
    } catch {
      setDrawerLeads([]); // keep empty — shows "Loading leads…" state
    }
  };

  const closeDrawer = () => { setSelected(null); setDrawerLeads([]); };
  const pct = (a: number, b: number) => b ? `(${Math.round(a/b*100)}%)` : '';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Order History</h1>
        <p className={styles.subtitle}>View past scrapes, enriched lists, and download your CSVs.</p>
      </header>

      <div className={styles.body}>
        {/* ── Table ── */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['Job ID','Search Name','Date','Total Leads','Verified Emails','Status','Actions'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr
                  key={order.id}
                  className={`${styles.tr} ${selected?.id === order.id ? styles.selected : ''}`}
                  onClick={() => openDrawer(order)}
                >
                  <td className={styles.td}><span className={styles.jobId}>{order.id}</span></td>
                  <td className={styles.td}><span className={styles.searchName}>{order.jobName}</span></td>
                  <td className={styles.td}><span className={styles.date}>📅 {order.date}</span></td>
                  <td className={styles.td}>{order.totalLeads}</td>
                  <td className={styles.td}>
                    {order.verifiedEmails}{' '}
                    <span className={styles.verifiedPct}>{pct(order.verifiedEmails, order.totalLeads)}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${order.status === 'completed' ? styles.badgeCompleted : styles.badgeRunning}`}>
                      ● {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className={styles.td} onClick={e => e.stopPropagation()}>
                    <div className={styles.actions}>
                      {/* Download — always fetches real data from API */}
                      <button className={styles.actionBtn} title="Download CSV"
                        onClick={() => fetchAndExport(order)}>
                        <IconDownload />
                      </button>
                      {/* Copy link — clipboard icon */}
                      <button className={styles.actionBtn} title="Copy link"
                        onClick={() => navigator.clipboard.writeText(window.location.origin + `/orders/${order.id}`)}>
                        <IconCopy />
                      </button>
                      {/* Delete — trash icon */}
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Delete order"
                        onClick={() => { if (confirm(`Delete ${order.id}?`)) setOrders(prev => prev.filter(o => o.id !== order.id)); }}>
                        <IconTrash />
                      </button>
                      {/* Three-dots — non-destructive options */}
                      <div style={{ position: 'relative' }} ref={menuRef}>
                        <button className={styles.actionBtn} title="More options"
                          onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}>
                          <IconDots />
                        </button>
                        {openMenu === order.id && (
                          <div className={styles.dropdown}>
                            <button className={styles.dropdownItem} onClick={() => { openDrawer(order); setOpenMenu(null); }}>View leads</button>
                            <button className={styles.dropdownItem} onClick={() => { navigator.clipboard.writeText(order.id); setOpenMenu(null); }}>Copy Job ID</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Slide-in Drawer ── */}
        <div className={`${styles.drawer} ${selected ? styles.open : ''}`}>
          {selected && (
            <>
              <div className={styles.drawerHeader}>
                <div>
                  <p style={{ fontSize: '.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{selected.id}</p>
                  <p className={styles.drawerTitle}>{selected.jobName}</p>
                </div>
                <button className={styles.drawerClose} onClick={closeDrawer}>✕</button>
              </div>
              <div className={styles.drawerStats}>
                <div className={styles.dStat}><p className={styles.dStatLabel}>Total</p><p className={styles.dStatValue}>{selected.totalLeads}</p></div>
                <div className={styles.dStat}><p className={styles.dStatLabel}>Verified</p><p className={`${styles.dStatValue} ${styles.accent}`}>{selected.verifiedEmails}</p></div>
                <div className={styles.dStat}><p className={styles.dStatLabel}>Status</p><p className={styles.dStatValue} style={{ fontSize: '.875rem', color: 'var(--green-badge-txt)' }}>✓ Done</p></div>
              </div>
              <div className={styles.drawerBody}>
                {drawerLeads.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: '.85rem', textAlign: 'center', padding: '2rem 0' }}>Loading leads…</p>
                ) : drawerLeads.map((lead, i) => (
                  <div key={i} className={styles.leadCard}>
                    <p className={styles.leadName}>{lead.firstName} {lead.lastName}</p>
                    {lead.role  && <p className={styles.leadRole}>{lead.role}</p>}
                    {lead.email && <span className={styles.leadEmail}>✓ {lead.email}</span>}
                    {lead.personalization && <p className={styles.leadPersonalization}>"{lead.personalization}"</p>}
                  </div>
                ))}
              </div>
              <div className={styles.drawerActions}>
                <button className={styles.exportBtn} onClick={() => fetchAndExport(selected)}>
                  ↓ Export CSV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
