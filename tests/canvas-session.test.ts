import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSessionSnapshot, parseStoredConnection, rememberConnection } from '../lib/canvas/session';

const good = { apiUrl: 'https://api.example.test', token: 'interview-token' };

test('the connection is available again after a page reload', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
  };
  rememberConnection(good, storage);
  const snapshot = getSessionSnapshot(storage);
  assert.deepEqual(parseStoredConnection(snapshot), good);
});

test('invalid or unavailable storage does not break the connection form', () => {
  assert.equal(parseStoredConnection(null), null);
  assert.equal(parseStoredConnection('{'), null);
  assert.equal(parseStoredConnection(JSON.stringify({ apiUrl: 'https://api.example.test' })), null);
  assert.equal(parseStoredConnection(JSON.stringify({ apiUrl: 'javascript:alert(1)', token: 'x' })), null);
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
  };
  assert.equal(getSessionSnapshot(blocked), null);
  assert.doesNotThrow(() => rememberConnection(good, blocked));
});
