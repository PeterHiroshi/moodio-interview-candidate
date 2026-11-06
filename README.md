# Canvas exercise

You have approximately 20 minutes to work on this small frontend exercise. You
will receive an API URL and a temporary token from your interviewer.

## Start

Requires Node.js 20 or newer; no dependency install is needed.

```sh
git clone https://github.com/PeterHiroshi/moodio-interview-candidate.git
cd moodio-interview-candidate
node serve.mjs
```

Open http://localhost:4173, enter the API URL and token, and select **Connect**.
If the interviewer provides an HTTPS API URL, use it as given. The token expires;
ask the interviewer for a fresh one if you cannot connect at the start.

## Task

Copy one of the image cards. The action feels slow and can leave the user unsure
whether it worked. Improve the experience while keeping the canvas consistent
with the backend. Consider unsuccessful requests and quick repeated actions.
You may edit anything in this directory. You do not need to edit the backend.
Explain your choices and anything you would test with more time.

## API

Send `Authorization: Bearer <token>` on every request. Responses are JSON.

- `GET /api/cards` → `{ "cards": [{ "id": "...", "title": "...", "image": "/images/morning.svg" }] }`
- `POST /api/cards/:id/copy` → `201 { "card": { "id": "...", "title": "...", "image": "..." } }`

The copied card gets a new server-generated ID. A failed request returns a
non-2xx status and `{ "error": "..." }`; an invalid or expired token returns
401. Copies are saved in the current session and returned by the next GET.
