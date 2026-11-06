'use client';

import { useState, type FormEvent } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';
import { Grid2X2, Layers2, Orbit, Sparkles } from 'lucide-react';
import { CanvasCard } from './CanvasCard';
import { canvasApi, type CanvasConnection, useCopyCardMutation, useGetCardsQuery } from '@/lib/redux/services/canvasApi';
import type { AppDispatch } from '@/lib/redux/store';

const defaultApi = 'https://moodio-interview-api.vercel.app';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = error.data;
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') return data.error;
  }
  return 'Unable to reach the API. Check your connection and token.';
}

export function CanvasPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [apiUrl, setApiUrl] = useState(defaultApi);
  const [token, setToken] = useState('');
  const [connection, setConnection] = useState<CanvasConnection | null>(null);
  const [copyError, setCopyError] = useState('');
  const { currentData: data, error, isFetching } = useGetCardsQuery(connection ?? skipToken);
  const [copyCard] = useCopyCardMutation();

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyError('');
    setConnection({ apiUrl: apiUrl.trim().replace(/\/$/, ''), token: token.trim() });
  }

  async function handleCopy(id: string) {
    if (!connection) return;
    setCopyError('');
    try {
      const result = await copyCard({ ...connection, id }).unwrap();
      dispatch(canvasApi.util.updateQueryData('getCards', connection, (draft) => {
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
            <label>API address<input type="url" required value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} autoComplete="url" /></label>
            <label className="token-field">Interview token<input type="password" required value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" placeholder="Paste your token" /></label>
            <button type="submit">Connect</button>
          </form>
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
