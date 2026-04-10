'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/');
    });
  }, [router]);

  // Prevent flash - show nothing until mounted
  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#080808', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          fontSize: '40px',
          background: 'linear-gradient(135deg, #00ffcc, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✦
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const supabase = getSupabase();
    let result;

    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        setSuccess('Account created! Check your email to confirm.');
        setLoading(false);
      } else {
        router.push('/');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      inset: 0,
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#080808',
      padding: '20px',
      overflow: 'hidden',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0,255,204,0.15) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
        bottom: '15%',
        right: '15%',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%', 
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '44px 40px',
      }}>
        {/* Eyebrow */}
        <div style={{ 
          display: 'inline-block',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: '20px',
        }}>
          AI-powered for Indian brands
        </div>

        {/* Heading */}
        <h1 style={{ 
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '26px',
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          Welcome to <span style={{
            background: 'linear-gradient(135deg, #00ffcc, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Agent</span>
        </h1>
        
        {/* Subheading */}
        <p style={{ 
          fontSize: '14px',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '28px',
        }}>
          Your social media marketing assistant
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'background 0.2s, border-color 0.2s',
            marginBottom: '20px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ 
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ 
            padding: '12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '13px',
            marginBottom: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{ 
            padding: '12px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '13px',
            marginBottom: '14px',
            textAlign: 'center',
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              placeholder="you@brand.com"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #00ffcc, #a855f7)',
              border: 'none',
              borderRadius: '12px',
              color: '#080808',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00ffcc',
              cursor: 'pointer',
              fontWeight: 500,
              marginLeft: '4px',
            }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}