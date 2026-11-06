# Preserve the interview connection on refresh

## Problem and scope

The canvas page stores the API address, token and active connection only in
React component state. A page refresh discards all three, so the candidate must
paste the token and connect again even while the token remains valid. The API
query and copy mutation both consume that same connection; there is one canvas
entry point in this exercise.

## Approach

- Save the submitted API address and token in the current browser tab's
  `sessionStorage`. Restore them after a refresh and reconnect to fetch the
  server's current canvas. Do not place the token in a URL or commit it.
- Keep the existing form usable to replace the address or token. Browser storage
  can be unavailable or contain invalid data; in those cases the form and an
  in-memory connection remain usable without crashing.
- The API continues to enforce the 20-minute token expiry. A restored expired
  token must produce the existing authentication error; it cannot renew itself.
  Session storage is scoped to the tab and does not promise recovery after the
  tab is closed.
- Preserve the delayed copy interaction that candidates are asked to fix.

## Scope ledger

| Observable behavior | Source | Status |
| --- | --- | --- |
| A submitted token remains available when the current tab is refreshed | User report | Planned |
| A custom API address is restored with its matching token | Both are needed to use the connection | Planned |
| The refreshed page reconnects and reads the saved canvas | Existing interview exercise flow | Planned |
| Expired tokens still receive the server's 401 response | Existing token contract | Planned |
| The deliberately slow copy interaction remains the candidate task | Existing interview exercise | Planned |

## Verification

Use focused tests for storage round trips, invalid/unavailable storage and the
connection-to-API flow. Run the Next.js typecheck, scoped lint and build. Browser
rendering and a physical refresh require manual verification; hand over exact
steps instead of claiming they were observed from unit tests.
