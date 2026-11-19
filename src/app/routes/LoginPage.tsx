import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../core/auth/AuthProvider';
import './login.css';

export function LoginPage() {
  const { configured, loading, session, message, signIn } = useAuth();
  const [pending, setPending] = useState(false);
  if (loading) return <p role="status">Checking your session…</p>;
  if (session) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    await signIn(String(data.get('email')).trim(), String(data.get('password')));
    form.reset();
    setPending(false);
  }

  return (
    <>
      <h1>Sign in to Luxraj CMS</h1>
      {message && <p role="alert">{message}</p>}
      <form className="login-form" onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required disabled={!configured || pending} />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required disabled={!configured || pending} />
        <button type="submit" disabled={!configured || pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </>
  );
}
