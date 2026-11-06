import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';

test('a submitted connection survives a simulated reload and shows the remaining time', async (t) => {
  const browser = new Window({ url: 'http://localhost:4173/' });
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const install = (name: string, value: unknown) => {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  };
  install('window', browser);
  install('document', browser.document);
  install('navigator', browser.navigator);
  install('IS_REACT_ACT_ENVIRONMENT', true);
  const previousFetch = globalThis.fetch;
  let now = 1_800_000_000_000;
  const previousNow = Date.now;
  Date.now = () => now;
  const token = `${Buffer.from(JSON.stringify({ exp: now + 65_000 })).toString('base64url')}.signature`;
  const requests: Array<{ url: string; authorization: string | null }> = [];
  globalThis.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    requests.push({ url: request.url, authorization: request.headers.get('authorization') });
    if (now >= 1_800_000_065_000) {
      return new Response(JSON.stringify({ error: 'Token is invalid or expired.' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ cards: [{ id: 'scene-1', title: 'Quiet morning', image: '/images/morning.svg' }] }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  };
  let cleanup = async () => {};
  t.after(async () => {
    await cleanup();
    globalThis.fetch = previousFetch;
    Date.now = previousNow;
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
    await browser.close();
  });

  const React = await import('react');
  const { createRoot, hydrateRoot } = await import('react-dom/client');
  const { renderToString } = await import('react-dom/server');
  const { Provider } = await import('react-redux');
  const { createAppStore } = await import('../lib/redux/store');
  const { canvasApi } = await import('../lib/redux/services/canvasApi');
  const { CanvasPage } = await import('../components/canvas/CanvasPage');
  const { act, createElement } = React;
  const stores: ReturnType<typeof createAppStore>[] = [];
  const createView = () => {
    const store = createAppStore();
    stores.push(store);
    return createElement(Provider, { store } as React.ComponentProps<typeof Provider>, createElement(CanvasPage));
  };
  const container = browser.document.createElement('div');
  browser.document.body.appendChild(container);
  let root = createRoot(container as unknown as HTMLElement);
  let mounted = true;
  cleanup = async () => {
    if (mounted) await act(async () => { root.unmount(); });
    for (const store of stores) store.dispatch(canvasApi.util.resetApiState());
  };
  await act(async () => { root.render(createView()); });

  const tokenInput = container.querySelector('input[type="password"]') as unknown as HTMLInputElement;
  const apiInput = container.querySelector('input[type="url"]') as unknown as HTMLInputElement;
  assert.ok(tokenInput);
  assert.ok(apiInput);
  const setter = Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value')?.set;
  assert.ok(setter);
  await act(async () => {
    setter.call(apiInput, 'https://alternate.example.test');
    apiInput.dispatchEvent(new browser.Event('input', { bubbles: true }) as unknown as Event);
  });
  await act(async () => {
    setter.call(tokenInput, token);
    tokenInput.dispatchEvent(new browser.Event('input', { bubbles: true }) as unknown as Event);
  });
  const form = container.querySelector('form');
  assert.ok(form);
  await act(async () => {
    form.dispatchEvent(new browser.Event('submit', { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  assert.deepEqual(requests[0], { url: 'https://alternate.example.test/api/cards', authorization: `Bearer ${token}` });
  assert.match(container.textContent ?? '', /Token remaining · 01:05/);
  assert.match(container.textContent ?? '', /Quiet morning/);
  await act(async () => { root.unmount(); });
  mounted = false;

  const serverHtml = renderToString(createView());
  assert.equal(serverHtml.includes(token), false);
  container.innerHTML = serverHtml;
  await act(async () => {
    root = hydrateRoot(container as unknown as HTMLElement, createView());
    mounted = true;
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  const restoredInput = container.querySelector('input[type="password"]') as unknown as HTMLInputElement;
  const restoredApi = container.querySelector('input[type="url"]') as unknown as HTMLInputElement;
  assert.equal(restoredInput.value, token);
  assert.equal(restoredApi.value, 'https://alternate.example.test');
  assert.deepEqual(requests[1], { url: 'https://alternate.example.test/api/cards', authorization: `Bearer ${token}` });
  assert.match(container.textContent ?? '', /Quiet morning/);
  assert.match(container.textContent ?? '', /Token remaining · 01:05/);
  now += 2_000;
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 1100)); });
  assert.match(container.textContent ?? '', /Token remaining · 01:03/);
  now += 64_000;
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 1100)); });
  assert.match(container.textContent ?? '', /Token expired · 00:00/);
  const copy = container.querySelector('button[aria-label="Copy Quiet morning"]');
  assert.ok(copy);
  await act(async () => {
    copy.dispatchEvent(new browser.Event('click', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  assert.match(container.textContent ?? '', /Token is invalid or expired/);
  await act(async () => { root.unmount(); });
  mounted = false;
});
