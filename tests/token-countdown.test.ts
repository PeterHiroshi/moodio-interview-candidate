import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

test('a token longer than one hour is displayed and counts down with hours', async (t) => {
  const browser = new Window({ url: 'http://localhost:4173/' });
  const originals = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries({ window: browser, document: browser.document, navigator: browser.navigator, IS_REACT_ACT_ENVIRONMENT: true })) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
  let now = 1_800_000_000_000;
  const originalNow = Date.now;
  Date.now = () => now;
  let cleanup = async () => {};
  t.after(async () => {
    await cleanup();
    Date.now = originalNow;
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
    await browser.close();
  });
  const { act, createElement } = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { TokenCountdown } = await import('../components/canvas/TokenCountdown');
  const container = browser.document.createElement('div');
  browser.document.body.appendChild(container);
  const root = createRoot(container as unknown as HTMLElement);
  cleanup = async () => { await act(async () => { root.unmount(); }); };
  await act(async () => { root.render(createElement(TokenCountdown, { expiresAt: now + 90 * 60_000 })); });
  assert.match(container.textContent ?? '', /Token remaining · 01:30:00/);
  now += 60_000;
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 1100)); });
  assert.match(container.textContent ?? '', /Token remaining · 01:29:00/);
});
