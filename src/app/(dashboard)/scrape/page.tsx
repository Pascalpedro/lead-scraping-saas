'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Scrape.module.css';

const STEPS = [
  { label: 'Apify Search Extraction',       desc: 'Scraping profiles from LinkedIn' },
  { label: 'Anymailfinder Enrichment',      desc: 'Finding and verifying professional emails' },
  { label: 'AI Personalisation Generation', desc: 'Running Anthropic / Claude prompts' },
  { label: 'Completion & Output',           desc: 'Compiling final CSV and building export' },
];

export default function ScrapePage() {
  const router = useRouter();
  const [jobName, setJobName]     = useState('');
  const [maxLeads, setMaxLeads]   = useState(200);
  const [persona, setPersona]     = useState('default');
  const [running, setRunning]     = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [runId, setRunId]         = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll status when we have a runId
  useEffect(() => {
    if (!runId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/scrape/status/${runId}`);
        const data = await res.json();
        if (data.step !== undefined) setStepIndex(data.step);
        if (data.orderId) {
          clearInterval(pollRef.current!);
          router.push(`/orders`);
        }
        if (data.error) {
          clearInterval(pollRef.current!);
          setRunning(false);
          alert(`Pipeline error: ${data.error}`);
        }
      } catch { /* network hiccup, keep polling */ }
    }, 3000);
    return () => clearInterval(pollRef.current!);
  }, [runId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setStepIndex(0);
    try {
      const res  = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobName, maxLeads, persona }),
      });
      const data = await res.json();
      if (data.runId) {
        setRunId(data.runId);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to start pipeline: ${msg}`);
      setRunning(false);
      setStepIndex(-1);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>New Scrape Job</h1>
        <p className={styles.subtitle}>Extract leads, verify emails, and personalize outreach in one click.</p>
      </header>

      <div className={styles.body}>
        {/* ── Form ── */}
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Job Name</label>
            <input
              className={styles.input}
              placeholder="e.g. VP Sales Series A USA"
              value={jobName}
              onChange={e => setJobName(e.target.value)}
              required
              disabled={running}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Max Leads</label>
              <input
                type="number"
                className={styles.input}
                value={maxLeads}
                min={10}
                max={2000}
                onChange={e => setMaxLeads(Number(e.target.value))}
                disabled={running}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Persona Prompt</label>
              <select
                className={styles.select}
                value={persona}
                onChange={e => setPersona(e.target.value)}
                disabled={running}
              >
                <option value="default">Default Icebreaker</option>
                <option value="custom">Custom (from Config)</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.runBtn} disabled={running}>
            {running ? (
              <>⟳ Running…</>
            ) : (
              <>▶ Run Workflow</>
            )}
          </button>
        </form>

        {/* ── Live Progress ── */}
        <div className={styles.progressPanel}>
          <p className={styles.progressTitle}>Live Progress</p>
          {STEPS.map((s, i) => {
            const done   = i < stepIndex;
            const active = i === stepIndex && running;
            return (
              <div key={i} className={styles.step}>
                <div className={`${styles.stepNum} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className={styles.stepInfo}>
                  <p className={`${styles.stepLabel} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                    {i + 1}. {s.label}
                  </p>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
