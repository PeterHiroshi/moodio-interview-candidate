import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTokenExpiry, remainingTime } from '../lib/canvas/token-expiry';

function tokenFor(payload: unknown) {
  return `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
}

test('token expiry is read from the issued payload', () => {
  assert.equal(readTokenExpiry(tokenFor({ session: 'session', exp: 1_800_001 })), 1_800_001);
  assert.equal(readTokenExpiry('broken-token'), null);
  assert.equal(readTokenExpiry(tokenFor({ exp: '1800001' })), null);
  assert.equal(readTokenExpiry(tokenFor({ exp: -1 })), null);
});

test('remaining time counts down without becoming negative', () => {
  assert.equal(remainingTime(7_200_000, 0), '02:00:00');
  assert.equal(remainingTime(360_000_000, 0), '100:00:00');
  assert.equal(remainingTime(3_600_000, 0), '01:00:00');
  assert.equal(remainingTime(3_599_000, 0), '59:59');
  assert.equal(remainingTime(1_800_000, 600_000), '20:00');
  assert.equal(remainingTime(1_800_000, 601_001), '19:59');
  assert.equal(remainingTime(1_800_000, 1_800_000), '00:00');
  assert.equal(remainingTime(1_800_000, 1_800_500), '00:00');
  assert.equal(remainingTime(1_800_000, 1_801_500), '00:00');
});
