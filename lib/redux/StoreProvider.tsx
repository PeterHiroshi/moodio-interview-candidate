'use client';

import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createAppStore } from './store';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createAppStore);
  return <Provider store={store}>{children}</Provider>;
}
