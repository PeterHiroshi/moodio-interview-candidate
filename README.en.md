# Canvas interaction exercise

English | [简体中文](README.md)

## Background

This is a small image canvas. Users can view image cards and create a copy of a card with **Copy**. A remote API stores the canvas, and each candidate has a separate temporary session.

Copying a card currently takes a while to show a result, leaving the user unsure whether the action worked. Your task is to improve that interaction while keeping the canvas consistent with the server.

The exercise is designed for approximately **20 minutes**. Your interviewer will provide a temporary token whose validity is set at issuance (20 minutes by default). The page displays the remaining time. If the token has expired before you start, ask your interviewer for a new one.

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
3. Select **Connect**. Three starter cards and the remaining token time should appear. Refreshing the current tab restores the connection automatically. The countdown is informational; the server determines expiry.
4. Select **Copy** on a card, observe the current interaction, and begin your changes.

Use `localhost:4173`, not `127.0.0.1` or another port: the API currently allows cross-origin requests only from that frontend address. Stop the local frontend server by closing the terminal or pressing `Ctrl+C`.

## Your task

Improve the experience of copying a card. You may change files in this repository; you do not need to change the backend, and there is no required implementation approach.

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

### Common conventions

- **Base URL**: `https://moodio-interview-api.vercel.app`
- **Format**: Requests and responses use HTTPS; API responses are UTF-8 JSON.
- **Authentication**: Except for the health check, canvas requests require `Authorization: Bearer <token>`. Your interviewer supplies the token; do not commit it or share it with other candidates.
- **Sessions**: Each token identifies a separate canvas. The server checks expiry when a request arrives; a request accepted before expiry may complete afterward. A new token starts a new canvas and does not inherit the old session's data.
- **Browser CORS**: Canvas endpoints allow requests from `http://localhost:4173`. Preflight permits `GET`, `POST`, `OPTIONS` and the `Authorization`, `Content-Type`, and `Idempotency-Key` headers.

Run the examples in a terminal. Set the base URL and enter the token supplied by your interviewer; `read` does not save the input as a shell history command, but the input is visible in the terminal.

```bash
API_URL="https://moodio-interview-api.vercel.app"
read -r INTERVIEW_TOKEN
```

### Health check

`GET /api/health` requires no token and checks whether the service responds; it does not check canvas storage.

```bash
curl -sS "$API_URL/api/health"
```

A successful response returns `200`:

```json
{ "status": "ok" }
```

The health check only supports GET. Other methods return `405` and `{ "error": "Method not allowed." }`.

### Read the canvas

`GET /api/cards` has no request body and returns cards for the current session.

```bash
curl -sS "$API_URL/api/cards" \
  -H "Authorization: Bearer $INTERVIEW_TOKEN"
```

A successful response returns `200`; this example shows the response shape:

```json
{
  "cards": [
    { "id": "scene-1", "title": "Quiet morning", "image": "/images/morning.svg" }
  ]
}
```

`cards` is an array containing the starter cards and saved copies in this session. Each card has an `id`, a `title`, and an `image` path in the frontend.

### Copy a card

In `POST /api/cards/:id/copy`, `:id` is the ID of a source card in the current session, such as `scene-1` or a previously returned copy ID. No request body is required.

```bash
curl -sS -X POST "$API_URL/api/cards/scene-1/copy" \
  -H "Authorization: Bearer $INTERVIEW_TOKEN"
```

A successful response returns `201`; `card` is the saved copy:

```json
{
  "card": { "id": "<server-generated ID>", "title": "Quiet morning copy", "image": "/images/morning.svg" }
}
```

Each new copy operation receives a server-generated ID. Copies belong to the current session and appear in subsequent `GET /api/cards` responses.

#### Optional request header

`Idempotency-Key`: 1–128 ASCII letters, digits, or `.`, `_`, `~`, `-`. Within a session, the same key and source card return the same copy; using that key for a different source card returns `409`. Without the header, each request creates a new copy. Idempotency records remain until the session data is deleted.

### Error responses

Canvas API errors have the shape `{ "error": "..." }`:

| Status | Meaning | Example |
| --- | --- | --- |
| `400` | Invalid idempotency key | `{ "error": "Invalid idempotency key." }` |
| `401` | Missing, invalid or expired token | `{ "error": "Token is invalid or expired." }` |
| `404` | Source card not found | `{ "error": "Card not found." }` |
| `409` | The session's key was already used for a different source card | `{ "error": "Idempotency key was used for another card." }` |
| `503` | Canvas service or storage temporarily unavailable | `{ "error": "The canvas is temporarily unavailable." }` |

If the token expires, ask your interviewer for a new one. Preflight from a disallowed origin returns `403`; other unmatched canvas requests may return `404`.
