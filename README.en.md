# Canvas interaction exercise

English | [简体中文](README.md)

## Background

This is a small image canvas. Users can view image cards and create a copy of a card with **Copy**. A remote API stores the canvas, and each candidate has a separate temporary session.

Copying a card currently takes a while to show a result, leaving the user unsure whether the action worked. Your task is to improve that interaction while keeping the canvas consistent with the server.

The exercise is designed for approximately **20 minutes**. Your interviewer will provide a temporary token. Its lifetime starts when it is issued, and it expires after about 20 minutes. If it has expired before you start, ask your interviewer for a new one.

## Start the project

You need Node.js 20.19+, 22.13+ (Node 22), or 24 and newer. Install dependencies before the interview timer starts if possible.

```bash
git clone https://github.com/PeterHiroshi/moodio-interview-candidate.git
cd moodio-interview-candidate
npm ci
npm run dev
```

Open **http://localhost:4173** in a browser, then:

1. Check that **API address** is `https://moodio-interview-api.vercel.app` (filled in by default).
2. Enter the token from your interviewer in **Interview token**.
3. Select **Connect**. Three starter cards should appear.
4. Select **Copy** on a card, observe the current interaction, and begin your changes.

Use `localhost:4173`, not `127.0.0.1` or another port: the API currently allows cross-origin requests only from that frontend address. Stop the local frontend server by closing the terminal or pressing `Ctrl+C`.

## Your task

Improve the experience of copying a card. You may change files in this repository; you do not need to change the backend, and there is no required implementation approach.

Consider these scenarios:

- Does the user receive timely feedback after selecting Copy?
- Does the page communicate success or failure clearly and remain consistent with the server?
- What happens when the user quickly copies the same card or different cards several times?
- After requests finish, does refreshing and reconnecting with the same unexpired token show the server's state?

When you are ready, explain your approach and tradeoffs to your interviewer, including anything you did not have time to handle or verify. You can run `npm test`, `npm run typecheck` and `npm run lint` to check your changes.

## Project structure

| Path | Contents |
| --- | --- |
| `app/` | Next.js routes, layout and global styles |
| `components/canvas/` | Canvas and card React components |
| `lib/redux/services/canvasApi.ts` | RTK Query API definitions |
| `lib/redux/` | Redux store and provider |
| `public/images/` | Example images |
| `tests/` | Basic API service test |

## API reference

Canvas requests must include `Authorization: Bearer <token>` in the request headers. Responses are JSON. The health check does not require a token.

### Health check

`GET /api/health` requires no token and returns `200` with `{ "status": "ok" }` when the service responds. It checks service liveness, not canvas storage.

### Read the canvas

`GET /api/cards`

A successful response returns `200`, for example:

```json
{
  "cards": [
    { "id": "scene-1", "title": "Quiet morning", "image": "/images/morning.svg" }
  ]
}
```

### Copy a card

`POST /api/cards/:id/copy`

A successful response returns `201` with the saved copy, for example:

```json
{
  "card": { "id": "<server-generated ID>", "title": "Quiet morning copy", "image": "/images/morning.svg" }
}
```

Each successful copy has a new server-generated ID. Copies are saved in the current session and returned by subsequent `GET /api/cards` requests.

A failure returns a non-2xx status and `{ "error": "..." }`. Invalid or expired tokens return `401`, an unknown card returns `404`, and the service may return `503` when temporarily unavailable. If your token expires, ask your interviewer for a new one; a new token starts a separate canvas and does not retain the previous session's data.
