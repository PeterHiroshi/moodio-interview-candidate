import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createAppStore } from '../lib/redux/store';
import { canvasApi } from '../lib/redux/services/canvasApi';

test('canvas service sends the token and consumes list and copy responses', async (t) => {
  const requests: Array<{ path: string | undefined; authorization: string | undefined }> = [];
  const server = createServer((req, res) => {
    requests.push({ path: req.url, authorization: req.headers.authorization });
    res.setHeader('Content-Type', 'application/json');
    if (req.headers.authorization !== 'Bearer interview-token') {
      res.writeHead(401).end(JSON.stringify({ error: 'Token is invalid or expired.' }));
    } else if (req.method === 'GET' && req.url === '/api/cards') {
      res.end(JSON.stringify({ cards: [{ id: 'scene-1', title: 'Quiet morning', image: '/images/morning.svg' }] }));
    } else if (req.method === 'POST' && req.url === '/api/cards/scene-1/copy') {
      res.writeHead(201).end(JSON.stringify({ card: { id: 'saved-copy', title: 'Quiet morning copy', image: '/images/morning.svg' } }));
    } else {
      res.writeHead(404).end(JSON.stringify({ error: 'Not found.' }));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const connection = { apiUrl: `http://127.0.0.1:${address.port}`, token: 'interview-token' };
  const store = createAppStore();
  t.after(() => { store.dispatch(canvasApi.util.resetApiState()); });

  const query = store.dispatch(canvasApi.endpoints.getCards.initiate(connection));
  assert.equal((await query.unwrap()).cards[0].id, 'scene-1');
  const copy = store.dispatch(canvasApi.endpoints.copyCard.initiate({ ...connection, id: 'scene-1' }));
  assert.equal((await copy.unwrap()).card.id, 'saved-copy');
  assert.deepEqual(requests, [
    { path: '/api/cards', authorization: 'Bearer interview-token' },
    { path: '/api/cards/scene-1/copy', authorization: 'Bearer interview-token' },
  ]);
  query.unsubscribe();

  const denied = store.dispatch(canvasApi.endpoints.getCards.initiate({ ...connection, token: 'expired-token' }));
  await assert.rejects(denied.unwrap(), (error: { status?: number }) => error.status === 401);
  denied.unsubscribe();
});
