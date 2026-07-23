# Meta Marketing Dashboard — Plan

## Goal

Show marketing performance (Meta Ads, Instagram, Facebook Page) inside the
**existing Dashboard page** (`src/features/dashboard/DashboardPage.tsx`).
No new nav item, no new route — this is an additional section on the
current dashboard.

## Scope (v1)

Included:
- Meta Ads (spend, impressions, clicks, CTR, ROAS)
- Instagram Business account (followers, reach, top posts)
- Facebook Page (page reach, top posts)

Explicitly excluded from v1:
- WhatsApp Business API — requires full Meta App Review (business
  verification, multi-day/week turnaround). Not worth it for v1.
  Revisit only if WhatsApp becomes a real requirement.

Rationale: Ads, Instagram, and Facebook Page insights are all readable via
a single System User access token on assets the business already owns/admins,
without going through Meta's App Review process.

---

## Part A — Meta-side setup (manual, human, no code)

These steps must be done by a human with admin access to the Facebook
Page, Instagram account, and Ads account. An agent cannot do this part —
it requires logging into Meta's UI and clicking through consent screens.

1. Go to https://developers.facebook.com, log in with the account that
   administers the Page/Instagram/Ads account.
2. Create App → type **Business** → name it (e.g. "House of Seya
   Dashboard") → attach it to a Business Manager account (create one at
   https://business.facebook.com if none exists).
3. In the app dashboard, add products:
   - **Marketing API** (for Ads insights)
   - **Instagram Graph API** (for Instagram insights — the Instagram
     account must be a **Business or Creator** account linked to a
     Facebook Page; personal IG accounts don't work)
   - Facebook Page insights use the base Graph API — no separate
     product needed.
4. In Business Manager (business.facebook.com → Business Settings):
   - Add/claim the Facebook Page.
   - Add the Ad Account.
   - Confirm the Instagram account is linked to the Page (Instagram
     Business Settings → "Linked Accounts").
   - Assign the app to these assets (Business Settings → Accounts →
     Apps).
5. Create a **System User** (Business Settings → Users → System Users →
   Add):
   - Assign admin access to the Page, Ad Account, and Instagram account.
   - Generate a System User access token with permissions:
     `ads_read`, `pages_read_engagement`, `instagram_basic`,
     `instagram_manage_insights`.
   - Set the longest expiration option available (System User tokens
     can be set to never expire).
6. Record the following values — these are the inputs the backend needs:
   - `META_ACCESS_TOKEN` — the System User token from step 5.
   - `META_PAGE_ID` — from `GET /me/accounts` in Graph API Explorer.
   - `META_IG_USER_ID` — from `GET /{page-id}?fields=instagram_business_account`.
   - `META_AD_ACCOUNT_ID` — from Ads Manager URL or Business Settings
     (format: `act_<numbers>`).
7. Sanity-check in Graph API Explorer
   (https://developers.facebook.com/tools/explorer) before writing any
   code:
   - `GET /{ad-account-id}/insights?fields=spend,impressions,clicks,ctr,cpc`
   - `GET /{ig-user-id}/insights?metric=follower_count,reach,impressions&period=day`
   - `GET /{page-id}/insights?metric=page_impressions,page_engaged_users&period=day`

   Confirm each returns real data with the token before proceeding to
   Part B.

**Blocking condition for agents:** Do not start Part B until
`META_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_USER_ID`, and
`META_AD_ACCOUNT_ID` all exist in the backend `.env` file and have been
validated against Graph API Explorer per step 7.

---

## Part B — Backend implementation

Repo: `houseOfSeyaInventoryManagementBackend`

### B1. Config

- Add to `.env` / `.env.example`:
  ```
  META_ACCESS_TOKEN=
  META_PAGE_ID=
  META_IG_USER_ID=
  META_AD_ACCOUNT_ID=
  ```
- Add these to `src/config/env.ts` following the existing pattern used
  for other env vars in that file (read + validate presence, but do not
  throw at boot if missing — the marketing feature must degrade
  gracefully, see B4).

### B2. Data model (Prisma — `prisma/schema.prisma`)

Add these models. Match the existing style in the schema (uuid ids,
`createdAt`/`updatedAt` where the rest of the schema has them).

```prisma
model AdAccountMetric {
  id           String   @id @default(uuid())
  date         DateTime // day granularity, unique per date
  spend        Decimal
  impressions  Int
  clicks       Int
  ctr          Decimal
  cpc          Decimal
  conversions  Int      @default(0)
  createdAt    DateTime @default(now())

  @@unique([date])
}

model InstagramMetric {
  id        String   @id @default(uuid())
  date      DateTime
  followers Int
  reach     Int
  impressions Int
  createdAt DateTime @default(now())

  @@unique([date])
}

model InstagramPostMetric {
  id        String   @id @default(uuid())
  postId    String   @unique
  permalink String?
  caption   String?
  likes     Int
  comments  Int
  reach     Int
  postedAt  DateTime
  createdAt DateTime @default(now())
}

model FacebookPageMetric {
  id        String   @id @default(uuid())
  date      DateTime
  reach     Int
  engagedUsers Int
  followers Int
  createdAt DateTime @default(now())

  @@unique([date])
}

model FacebookPostMetric {
  id        String   @id @default(uuid())
  postId    String   @unique
  permalink String?
  message   String?
  reach     Int
  engagement Int
  postedAt  DateTime
  createdAt DateTime @default(now())
}

model MetaSyncLog {
  id          String   @id @default(uuid())
  platform    String   // "ads" | "instagram" | "facebook"
  status      String   // "success" | "error"
  message     String?
  syncedAt    DateTime @default(now())
}
```

Run `npx prisma migrate dev --name add_meta_marketing_tables` after
adding these.

### B3. Module structure

Follow the existing module pattern (see `src/modules/inventory/` as the
reference: `*.controller.ts`, `*.service.ts`, `*.routes.ts`,
`*.validation.ts`).

Create `src/modules/marketing/`:
- `marketing.service.ts` — three sync functions (`syncAdsMetrics`,
  `syncInstagramMetrics`, `syncFacebookMetrics`), each:
  1. Calls the relevant Graph API endpoint via `axios` or `fetch`.
  2. Upserts rows into the matching Prisma table, keyed by `date`
     (idempotent — safe to re-run for the same day).
  3. Writes a row to `MetaSyncLog` recording success/failure.
  Also add read functions: `getAdsMetrics(range)`,
  `getInstagramMetrics(range)`, `getFacebookMetrics(range)`,
  `getMarketingSummary(range)` (combines totals across all three).
- `marketing.controller.ts` — handlers for the routes below, following
  the `asyncHandler` wrapper pattern used elsewhere.
- `marketing.routes.ts` — registered in `src/app.ts` alongside the other
  route modules, under `authenticate` + `authorize(['ADMIN'])` (reuse
  existing `authorize` middleware — marketing/spend data should be
  ADMIN-only, matching the Role enum already in the schema).

### B4. Graceful degradation (important)

- If `META_ACCESS_TOKEN` (or any required env var) is missing, sync
  functions must return early with a clear `MetaSyncLog` entry
  (`status: "error"`, message explaining what's missing) — **not**
  throw an unhandled exception that crashes the request.
- Each platform's sync/read must be independently failable: if Ads
  fails but Instagram succeeds, the summary endpoint still returns
  Instagram data with an error flag for Ads, not a 500 for everything.

### B5. Sync trigger

- Add `POST /api/v1/marketing/sync` — triggers all three syncs
  on-demand, returns per-platform success/failure.
- Do not build a cron scheduler in v1 unless explicitly asked — a
  manual sync button (wired from the frontend, see C3) is sufficient
  to start.

### B6. Routes summary

```
GET  /api/v1/marketing/summary?range=30d
GET  /api/v1/marketing/ads?range=30d
GET  /api/v1/marketing/instagram?range=30d
GET  /api/v1/marketing/facebook?range=30d
POST /api/v1/marketing/sync
```

`range` accepts `7d` | `30d` | `90d`, default `30d`. Follow the same
query-param validation style already used in
`src/utils/pagination.ts` for other list endpoints (parse, validate
against an allowed set, fall back to default — don't throw on bad
input).

---

## Part C — Frontend implementation

Repo: `houseOfSeyaInventoryManagement`

### C1. API + hooks

Create `src/features/marketing/api.ts` and `src/features/marketing/hooks.ts`
following the exact pattern of `src/features/dashboard/api.ts` and
`src/features/dashboard/hooks.ts` (React Query, same client from
`src/lib/apiClient.ts`).

- `fetchMarketingSummary(range)`, `fetchAdsMetrics(range)`,
  `fetchInstagramMetrics(range)`, `fetchFacebookMetrics(range)`,
  `triggerMarketingSync()`.
- `useMarketingSummary(range)` etc. as React Query hooks, mirroring
  `useDashboardSummary()`.

### C2. Types

Add to `src/types/index.ts`, matching backend DTOs:
`AdMetric`, `InstagramMetric`, `FacebookMetric`, `MarketingSummary`.

### C3. UI — extend `DashboardPage.tsx`, do not create a new page/route

In `src/features/dashboard/DashboardPage.tsx`:

1. Add 2–3 more `StatTile`s to the existing stat grid (or a new grid row
   directly below it): **Ad spend (range)**, **Instagram followers**,
   **Facebook page reach** — same `StatTile` component already imported,
   no new component needed.
2. Add one more `Card` below the existing "Recent invoices" /
   "Low stock alerts" pair, titled **"Marketing performance"**:
   - A small range selector (7d/30d/90d) — reuse the existing `Select`
     component.
   - A "Sync now" button (reuse `Button`) that calls the sync mutation
     and shows a loading/last-synced state.
   - Either a 3-way internal toggle (Ads / Instagram / Facebook) showing
     a table each via the existing `Table` component, or three stacked
     mini-tables — match whichever is visually simpler once B is done;
     do not over-engineer this before real data exists.
3. If a platform has no data (env vars not configured, or sync never
   run), show the existing `EmptyState` component with a message like
   "Connect Meta to see [X] stats" instead of erroring — this must not
   break the rest of the dashboard if marketing data is unavailable.

### C4. Explicitly do NOT do

- Do not add a new sidebar/nav entry.
- Do not add a new route in `src/app/routes.tsx`.
- Do not build WhatsApp integration in this pass.
- Do not build a cron/scheduling UI in this pass — manual sync button
  only.

---

## Build order (for whoever/whatever implements this)

1. Confirm Part A is fully done and validated (blocking condition
   above) — an agent should ask the user to confirm this before writing
   any backend code.
2. Backend: schema + migration (B2).
3. Backend: Ads sync + read + route only, end-to-end, prove the whole
   pipeline works (token → Graph API → DB → API response) before
   touching Instagram/Facebook.
4. Backend: add Instagram sync/read/route, then Facebook, reusing the
   proven pattern from step 3.
5. Frontend: API/hooks/types (C1, C2).
6. Frontend: extend `DashboardPage.tsx` (C3) last, once real endpoints
   return real data — do not build the UI against mocked data and swap
   later.

## Definition of done

- `POST /marketing/sync` successfully populates all three tables from
  live Graph API data.
- `GET /marketing/summary` returns correct aggregates for at least one
  full day of synced data.
- Dashboard page shows the new stat tiles and marketing card without
  affecting existing dashboard sections if marketing sync has never run.
- No new nav item, no new route, no WhatsApp code, in this pass.
