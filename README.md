# ThreadTrace

A consumer-facing **Digital Garment Passport** that binds a physical garment to a
verified digital record. Its reason to exist is honest disclosure: where a rival
platform would quietly hide an inconvenient fact, ThreadTrace names the gap out
loud.

- **Stack:** Next.js 15.3.1 (App Router) · React 19 · TypeScript · static export
- **Host:** GitHub Pages at `sammiecxv.github.io` (canonical, permanent)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (dev only — never encoded on a tag)
npm run build      # static export to ./out
```

Open `/` for the Gateway (scan), or `/g/L01` for the demo passport.

## Deploy to GitHub Pages

This is a **user/org page** (`sammiecxv.github.io`), served from the domain root,
so `next.config.mjs` needs no `basePath`. Push to `main`; the workflow in
`.github/workflows/deploy.yml` builds and publishes `./out`. In the repo settings
set **Pages → Source → GitHub Actions**.

`public/.nojekyll` is included so GitHub serves the `_next/` asset folders.

> If you ever move this to a *project* page (`sammiecxv.github.io/threadtrace`),
> set `basePath` and `assetPrefix` to `"/threadtrace"` in `next.config.mjs` —
> and nowhere else. The tag URL scheme is unaffected.

## URL stability (non-negotiable)

A tag encodes only the **root** or a **stable shortcode path** (`/g/L01`). The app
resolves that path to the record via `resolveShortcode()` in
`src/data/resolve.ts`. No `localhost`, environment-specific, or data-carrying URL
is ever embedded where a tag points. Any future UI change leaves the path valid,
so no tag is ever reprinted.

## Architecture

```
src/
  data/
    types.ts        shared record types (one record underlies both POVs)
    garments.ts     the demo fixture, tuned to exactly 75% Checked
    resolve.ts      data-layer interface: evidence→mark, scoring, shortcode resolver
  components/
    honesty/        HonestyMark, HonestyRing, TrustRegister  (global, consumed everywhere)
    RecordContext   the single in-memory editable record + POV state (no localStorage)
    consumer/       Gateway, ConsumerPassport, MaterialsHub, StoryBook, CircularityPortal
    supplier/       OperatorSignIn, SupplierConsole, OperationsLedger, RecordAuthoring
  app/
    page.tsx                 root → Gateway
    g/[shortcode]/page.tsx   resolves a tag path → passport (generateStaticParams)
```

### Honesty is derived, never asserted

`markFor(evidence)` in `resolve.ts` is the single rule:
`certificate | audit → Checked`, `self_declared → Told us`, `none → Not yet`.
Suppliers attach evidence; consumers read the resolved mark. Edit evidence in the
Supplier POV and the ring, chips and breakdown all move — switch the top bar to
**Shopping** to watch a change land.

### The oracle problem, surfaced

A chain anchor proves the *record* hasn't changed, not that the *input* was true.
`OracleNote` says exactly that wherever a claim is anchored but not yet Checked.

## Acceptance checks → where they live

| Check | Where |
|---|---|
| Tag encodes root or `/g/{shortcode}`, survives UI change | `resolve.ts`, `g/[shortcode]/page.tsx` |
| Every claim is Checked / Told us / Not yet; gaps visible | `HonestyMark`, `ClaimRow` (empty → "Not recorded yet — see mark") |
| Three registers distinguishable on sight | `TrustRegister` variants in `components.css` |
| Chain anchor = integrity, not truth | `OracleNote` |
| Opens in Consumer POV every fresh scan | `RecordContext` (`pov` defaults to `consumer`) |
| Supplier reachable only via switch + mocked sign-in | `PassportShell`, `OperatorSignIn` |
| No raw operator field leaks to shopper view | consumer reads only resolved, marked claims |
| Static export on GitHub Pages | `next.config.mjs` `output: "export"`, verified `./out` |

## Note on the pinned Next version

`next@15.3.1` is pinned per the build spec. npm flags a security advisory for that
exact patch; bumping to the latest `15.3.x` is drop-in and recommended before any
real deployment.
