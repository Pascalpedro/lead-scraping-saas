'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import s from '../auth.module.css';
import { createClient } from '@/lib/supabase/client';
import { PuzzleLogo } from '@/components/PuzzleLogo';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
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

        <h1 className={s.heading}>Create your account</h1>
        <p className={s.sub}>Start building your outbound cold email list today</p>

        {error && <div className={s.error}>{error}</div>}

        <form className={s.form} onSubmit={handleSignup}>
          <div className={s.field}>
            <label className={s.label}>Full Name</label>
            <input type="text" className={s.input} placeholder="John Doe" required value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Email Address</label>
            <input type="email" className={s.input} placeholder="you@company.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className={s.field}>
            <label className={s.label}>Password</label>
            <input type="password" className={s.input} placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className={s.submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Get Started'}
          </button>
        </form>

        <p className={s.footer}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
