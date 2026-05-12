'use client';

import React from 'react';
import Link from 'next/link';
import styles from './OrderDetail.module.css';

// Mock leads per order
const MOCK_LEADS = [
  {
    id: 1,
    firstName: 'Marcus',
    lastName: 'Whitfield',
    email: 'm.whitfield@harborline.co',
    role: 'Manager, Mobility Sales @ Harborline',
    personalization: 'I loved the piece you wrote on scaling mobility operations — the part about distributed fleet logistics really resonated with me.',
  },
  {
    id: 2,
    firstName: 'Priya',
    lastName: 'Ramaswamy',
    email: 'priya.r@harborline.co',
    role: 'Sales Manager @ Harborline',
    personalization: "Congrats on Harborline's recent Series B — growing a sales team in a marketplace model is genuinely hard to do well.",
  },
  {
    id: 3,
    firstName: 'Jonas',
    lastName: 'Varga',
    email: 'jonas@helmstead.io',
    role: 'Owner, Helmstead Finance',
    personalization: "Running a boutique finance firm in today's market takes real conviction — curious what's driving your growth strategy.",
  },
  {
    id: 4,
    firstName: 'Nadia',
    lastName: 'El-Amin',
    email: 'n.elamin@aegfuels.co',
    role: 'Senior Manager, APAC Sales',
    personalization: 'Managing APAC expansion across multiple time zones is no small feat — I imagine coordinating pipeline across those regions keeps you busy.',
  },
  {
    id: 5,
    firstName: 'Desmond',
    lastName: 'Carrington',
    email: 'dcarrington@keystone.com',
    role: 'Lead Territory Manager @ Keystone',
    personalization: "Territory managers at Keystone always seem to have a strong handle on the enterprise space — I'd love to compare notes.",
  },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const handleExport = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Role', 'Personalization'];
    const rows = MOCK_LEADS.map(l =>
      [l.firstName, l.lastName, l.email, l.role, l.personalization].map(v => `"${v.replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}-leads.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <Link href="/orders" className={styles.back}>← Back to Orders</Link>

      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.orderId}>Order {id}</p>
          <h1 className={styles.title}>
            <strong>Lead</strong> Details
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Leads</span>
          <span className={styles.statValue}>{MOCK_LEADS.length}</span>
        </div>
        <div className={`${styles.statCard} ${styles.accentCard}`}>
          <span className={styles.statLabel}>Emails Found</span>
          <span className={styles.statValue}>{MOCK_LEADS.filter(l => l.email).length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Personalized</span>
          <span className={styles.statValue}>{MOCK_LEADS.filter(l => l.personalization).length}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Status</span>
          <span className={styles.statValue} style={{ fontSize: '1.25rem', color: '#12751e' }}>✓ Complete</span>
        </div>
      </div>

      {/* Leads table */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Enriched Leads</h2>
          <button className={styles.exportBtn} onClick={handleExport}>
            ↓ Export CSV
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Role</th>
                <th className={styles.th}>Personalization</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.id} className={styles.tr}>
                  <td className={styles.td}><strong>{lead.firstName} {lead.lastName}</strong></td>
                  <td className={styles.td}>
                    <span className={styles.emailBadge}>✓ {lead.email}</span>
                  </td>
                  <td className={styles.td}>{lead.role}</td>
                  <td className={styles.td}>
                    <div className={styles.personalization}>{lead.personalization}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
