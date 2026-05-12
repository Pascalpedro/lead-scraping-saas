'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from '../auth.module.css';
import { createClient } from '@/lib/supabase/client';
import { PuzzleLogo } from '@/components/PuzzleLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/scrape');
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>
          <div className={s.logoMark}>
            <PuzzleLogo className={s.puzzleIcon} />
          </div>
          RMKR
        </div>

        <h1 className={s.heading}>Welcome back</h1>
        <p className={s.sub}>Log in to your account to continue</p>

        {error && <div className={s.error}>{error}</div>}

        <form className={s.form} onSubmit={handleLogin}>
          <div className={s.field}>
            <label className={s.label}>Email Address</label>
            <input type="email" className={s.input} placeholder="you@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Password</label>
            <input type="password" className={s.input} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className={s.submit} disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className={s.footer}>
          Don't have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
