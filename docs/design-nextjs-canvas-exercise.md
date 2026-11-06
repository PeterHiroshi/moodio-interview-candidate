# Next.js canvas interview exercise

## Context

Candidates should work in a small project that resembles Moodio's frontend
stack. Moodio uses Next.js App Router, React, TypeScript, Tailwind CSS and Redux
Toolkit / RTK Query. The interview remains approximately 20 minutes and focuses
on the existing slow canvas-copy interaction.

## Candidate experience

- Run the frontend locally as a Next.js application on `localhost:4173`; install
  the declared dependencies first. The deployed interview API and its CORS
  configuration remain unchanged.
- Enter the existing API address and an interviewer-issued 20-minute token,
  connect to a session, and see the same three starter cards and Copy actions.
- Keep the starter interaction deliberately response-gated: a copied card only
  appears after its API request succeeds. The candidate diagnoses and improves
  the experience. Do not include a finished fix or solution in the repository.
- Preserve the exercise's expectations for failed requests, rapid repeated
  actions, server-generated IDs and reloading saved state. The backend remains
  independent and unavailable as source in the candidate repository.
- Keep Chinese and English READMEs aligned with the actual setup, file structure
  and API contract; do not require candidates to configure a production account.

## Implementation boundaries

- Use Next.js 16, React 19, TypeScript and Tailwind CSS, with Redux Toolkit / RTK
  Query for the small client-side API and state layer. Keep the implementation
  compact enough for a candidate to navigate during the interview.
- Separate the route/layout, canvas UI, API service and store in recognizable
  directories. Render the existing Moodio-inspired canvas rather than trying to
  reproduce all of Moodio's product or dependencies.
- Keep the API URL and token entered at runtime, use the same existing API
  contract, and avoid committing credentials or backend code.

## Scope ledger

| Item | Source | Status |
| --- | --- | --- |
| Candidate runs a real Next.js / React / TypeScript project | User request and Moodio stack | Built; production build and page request verified |
| Project uses Moodio's Tailwind and Redux Toolkit / RTK Query patterns | Moodio project guidance | Built; API service checked with live and local requests |
| Slow copy remains a candidate task, with success, failure, concurrency and reload cases | Existing accepted exercise | Built; browser interaction not yet verified |
| Existing hosted API and 20-minute isolated token continue to work | Existing accepted exercise | Live API calls verified |
| Candidate can install, start and navigate the project using both README languages | Existing candidate repository | Written; clean install and build verified, browser navigation not yet verified |
| No backend source or interview solution is distributed to candidates | Existing accepted exercise | Repository file list reviewed |

## Verification

Run typecheck, a production build, scoped lint and relevant tests. Call the
running Next.js page and the real API using an issued token; these checks do not
prove browser appearance or interaction. Provide numbered manual cases for the
candidate flow; do not run browser automation without Peter's request.
