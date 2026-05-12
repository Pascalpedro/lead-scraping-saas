'use client';
import React, { useState, useEffect } from 'react';
import styles from './Config.module.css';

const DEFAULT_SYSTEM = `You are a helpful, intelligent writing assistant.`;
const DEFAULT_USER = `Your task is to take, as input, a bunch of information about a prospect, and then generate a customized, one-line email icebreaker to imply that the rest of my communique is personalized.

You will return your icebreakers in the following JSON format:
{"verdict":"true or false, string", "icebreaker": "Hey {firstName}. Love {thing} — also work in {paraphrasedIndustry}. Wanted to run something by you.", "shortenedCompanyName": "Shortened version of company name"}

Rules:
- Write in a spartan/laconic tone of voice.
- Shorten company names wherever possible ("XYZ" not "XYZ Agency").
- Shorten locations ("San Fran" not "San Francisco").
- If data is of a company not a person, return verdict: "false".`;

interface Config {
  apifyToken:        string;
  apolloKey:         string;
  anthropicKey:      string;
  geminiKey:         string;
  anymailfinderKey:  string;
  prospeoKey:        string;
  systemPrompt:      string;
  userPrompt:        string;
}

export default function ConfigPage() {
  const [cfg, setCfg]       = useState<Config>({
    apifyToken: '', apolloKey: '', anthropicKey: '', geminiKey: '',
    anymailfinderKey: '', prospeoKey: '',
    systemPrompt: DEFAULT_SYSTEM, userPrompt: DEFAULT_USER,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => {
      if (d.config) setCfg(prev => ({ ...prev, ...d.config }));
    }).catch(() => {});
  }, []);

  const set = (k: keyof Config) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCfg(prev => ({ ...prev, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Save failed.'); }
    finally { setSaving(false); }
  };

  // AI provider indicator
  const aiProvider = cfg.anthropicKey ? 'anthropic' : cfg.geminiKey ? 'gemini' : 'none';
  // Email enrichment indicator
  const emailProvider = cfg.anymailfinderKey ? 'anymailfinder' : cfg.prospeoKey ? 'prospeo' : 'none';
  // Scraper indicator
  const scrapeProvider = cfg.apifyToken && cfg.apolloKey ? 'both' : cfg.apifyToken ? 'apify' : cfg.apolloKey ? 'apollo' : 'none';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Workspace Settings</h1>
          <p className={styles.subtitle}>Manage your API integrations and personalization rules.</p>
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? '…' : saved ? '✓ Saved' : '✦ Save Changes'}
        </button>
      </div>

      <form className={styles.body} onSubmit={handleSave}>
        {/* ── Left: API Integrations ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            API Integrations
          </div>

          {/* ── Scraping ── */}
          <p className={styles.groupLabel}>Scraping</p>
          <div className={styles.field}>
            <label className={styles.label}>
              Apify API Token
              <span className={styles.labelNote}>(Primary)</span>
              {scrapeProvider === 'apify' || scrapeProvider === 'both' ? <span className={`${styles.aiPill} ${styles.aiPillAnthropic}`}>● Active</span> : null}
            </label>
            <input type="password" className={styles.input} placeholder="apify_api_…" value={cfg.apifyToken} onChange={set('apifyToken')} autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Apollo API Key
              <span className={styles.labelNote}>(Fallback if Apify hits limits)</span>
              {scrapeProvider === 'both' ? <span className={`${styles.aiPill} ${styles.aiPillGemini}`}>● Active (fallback)</span> : scrapeProvider === 'apollo' ? <span className={`${styles.aiPill} ${styles.aiPillAnthropic}`}>● Active</span> : null}
            </label>
            <input type="password" className={styles.input} placeholder="apollo_…" value={cfg.apolloKey} onChange={set('apolloKey')} autoComplete="off" />
          </div>

          {/* ── AI — Anthropic primary, Gemini fallback ── */}
          <p className={styles.groupLabel}>AI Personalisation</p>
          <div className={styles.field}>
            <label className={styles.label}>
              Anthropic API Key
              <span className={styles.labelNote}>(Claude 3.5 Sonnet · Primary)</span>
              {aiProvider === 'anthropic' && <span className={`${styles.aiPill} ${styles.aiPillAnthropic}`}>● Active</span>}
            </label>
            <input type="password" className={styles.input} placeholder="sk-ant-…" value={cfg.anthropicKey} onChange={set('anthropicKey')} autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Gemini API Key
              <span className={styles.labelNote}>(Gemini 1.5 Pro · Fallback)</span>
              {aiProvider === 'gemini' && <span className={`${styles.aiPill} ${styles.aiPillGemini}`}>● Active (fallback)</span>}
              {aiProvider === 'none' && <span className={`${styles.aiPill} ${styles.aiPillNone}`}>No AI configured</span>}
            </label>
            <input type="password" className={styles.input} placeholder="AIzaSy…" value={cfg.geminiKey} onChange={set('geminiKey')} autoComplete="off" />
          </div>

          {/* ── Email enrichment — AnyMailFinder primary, Prospeo fallback ── */}
          <p className={styles.groupLabel}>Email Enrichment</p>
          <div className={styles.field}>
            <label className={styles.label}>
              AnyMailFinder API Key
              <span className={styles.labelNote}>(Primary)</span>
              {emailProvider === 'anymailfinder' && <span className={`${styles.aiPill} ${styles.aiPillAnthropic}`}>● Active</span>}
            </label>
            <input type="password" className={styles.input} placeholder="amf_…" value={cfg.anymailfinderKey} onChange={set('anymailfinderKey')} autoComplete="off" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Prospeo API Key
              <span className={styles.labelNote}>(Fallback if AnyMailFinder fails)</span>
              {emailProvider === 'prospeo' && <span className={`${styles.aiPill} ${styles.aiPillGemini}`}>● Active (fallback)</span>}
            </label>
            <input type="password" className={styles.input} placeholder="pro_…" value={cfg.prospeoKey} onChange={set('prospeoKey')} autoComplete="off" />
          </div>
        </div>

        {/* ── Right: Prompt Engineering ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            Prompt Engineering
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text-2)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Define the rules RMKR should follow when generating the{' '}
            <code style={{ color: 'var(--accent)' }}>{'{{personalization}}'}</code> column for each lead.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>System Prompt</label>
            <textarea className={styles.textarea} value={cfg.systemPrompt} onChange={set('systemPrompt')} rows={3} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>User Formatting Instruction</label>
            <textarea className={styles.textarea} value={cfg.userPrompt} onChange={set('userPrompt')} rows={9} />
          </div>

          <div className={styles.vars}>
            <p className={styles.varsTitle}>✦ Prompt Variables Injected</p>
            <p className={styles.varsList}>
              {'{{firstName}}, {{lastName}}, {{headline}}, {{industry}}, {{organisation_name}}, {{location}}, {{email}}'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
