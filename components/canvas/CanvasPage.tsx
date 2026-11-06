'use client';

import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { Grid2X2, Layers2, Orbit, Sparkles } from 'lucide-react';
import { CanvasCard } from './CanvasCard';
import { TokenCountdown } from './TokenCountdown';
import { getSessionSnapshot, parseStoredConnection, rememberConnection } from '@/lib/canvas/session';
import { readTokenExpiry } from '@/lib/canvas/token-expiry';
import { canvasApi, type CanvasConnection, useCopyCardMutation, useGetCardsQuery } from '@/lib/redux/services/canvasApi';
import type { AppDispatch } from '@/lib/redux/store';

const defaultApi = 'https://moodio-interview-api.vercel.app';
// Same-tab submissions update React state; storage is read again on a reload.
const subscribeToSession = () => () => {};
const getServerSnapshot = () => null;

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') return data.error;
  }
  return 'Unable to reach the API. Check your connection and token.';
}

export function CanvasPage() {
  const dispatch = useDispatch<AppDispatch>();
  const snapshot = useSyncExternalStore(subscribeToSession, getSessionSnapshot, getServerSnapshot);
  const restored = useMemo(() => parseStoredConnection(snapshot), [snapshot]);
  const [connection, setConnection] = useState<CanvasConnection | null>(null);
  const [draft, setDraft] = useState<CanvasConnection | null>(null);
  const activeConnection = connection ?? restored;
  const fields = draft ?? activeConnection ?? { apiUrl: defaultApi, token: '' };
  const tokenExpiry = activeConnection ? readTokenExpiry(activeConnection.token) : null;
  const [copyError, setCopyError] = useState('');
  const { currentData: data, error, isFetching } = useGetCardsQuery(activeConnection ?? skipToken);
  const [copyCard] = useCopyCardMutation();

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyError('');
    const next = { apiUrl: fields.apiUrl.trim().replace(/\/$/, ''), token: fields.token.trim() };
    rememberConnection(next);
    setConnection(next);
    setDraft(null);
  }

  async function handleCopy(id: string) {
    if (!activeConnection) return;
    setCopyError('');
    try {
      const result = await copyCard({ ...activeConnection, id }).unwrap();
      dispatch(canvasApi.util.updateQueryData('getCards', activeConnection, (draft) => {
        draft.cards.push(result.card);
      }));
    } catch (copyFailure) {
      setCopyError(errorMessage(copyFailure));
    }
  }

  const status = copyError || (error ? errorMessage(error) : isFetching ? 'Connecting…' : data ? 'Connected. Your canvas is ready.' : 'Connect with the details provided by your interviewer.');

  return (
    <>
      <header className="topbar">
        <div className="brand"><Sparkles aria-hidden="true" className="brand-mark" size={24} /> Moodio <span className="divider" /><span className="project-name">Canvas exercise</span></div>
        <span className="top-label">INTERVIEW PROJECT</span>
      </header>
      <main className="app-shell">
        <aside className="sidebar" aria-hidden="true"><div className="avatar">M</div><Grid2X2 className="sidebar-active" /><Layers2 /><Orbit /></aside>
        <section className="workspace">
          <div className="heading">
            <div><div className="eyebrow">YOUR WORKSPACE / CANVAS</div><h1>Visual directions</h1><p>Explore your ideas and make room for new ones.</p></div>
            <span className="badge"><Sparkles size={13} aria-hidden="true" /> Creative board</span>
          </div>
          <form onSubmit={connect} className="access">
            <label>API address<input type="url" required value={fields.apiUrl} onChange={(event) => setDraft({ ...fields, apiUrl: event.target.value })} autoComplete="url" /></label>
            <label className="token-field">Interview token<input type="password" required value={fields.token} onChange={(event) => setDraft({ ...fields, token: event.target.value })} autoComplete="off" placeholder="Paste your token" /></label>
            <button type="submit">Connect</button>
          </form>
          {activeConnection && <TokenCountdown key={tokenExpiry ?? 'unknown'} expiresAt={tokenExpiry} />}
          <div role="status" aria-live="polite" className="message">{status}</div>
          <div className="canvas-header"><div><span className="canvas-dot" />Canvas {data && <span>· {data.cards.length} cards</span>}</div><span>Copy a card to explore a direction</span></div>
          <div className="canvas">
            {data?.cards.map((card) => <CanvasCard key={card.id} card={card} onCopy={handleCopy} />)}
          </div>
        </section>
      </main>
    </>
  );
}
