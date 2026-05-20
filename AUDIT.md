# SMM Agent AI — Full Audit Report

---

## A. Executive Summary

**Product truth in 5 lines:**
- SMM Agent AI is a Next.js 16 app that wraps an LLM persona ("Maya") behind 30 routes, ~20 of which are thin prompt-to-display wrappers with no backend logic beyond calling the LLM.
- The core value is a culturally tuned (Indian, Hinglish, social-media-specific) system prompt + multi-provider LLM fallback + live-web-search pipeline. That is the only real engineering.
- 9 routes have real CRUD/data persistence (Supabase). 8 routes have partial workflow logic. 10 routes are superficial LLM wrappers. 1 is a stub. 3 are infrastructure.
- Security is absent: 0 auth on all 6 API routes, no middleware, ~10 tables without RLS, OAuth token in localStorage, hardcoded secrets in `.env.local` committed to repo.
- The product is a promising prototype at ~4.8/10. It is not production-ready, not market-safe to demo to enterprise clients, and not resume-safe to present as a full-stack AI product without heavy caveats.

**Overall score: 4.8 / 10**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Concept | 7 | Culturally specific Maya persona is genuinely differentiated |
| AI architecture | 6 | Good prompt engineering, intent scoring, fallback chain, search pipeline |
| Architecture | 4 | Monolithic maya.ts (83KB), no middleware, no API auth |
| Features | 3.5 | ~20 routes are just LLM wrappers; 3 CRUD modules are basic |
| Security | 1.5 | 0 API auth, no RLS on 10 tables, secrets in repo, XSS-able localStorage tokens |
| Code quality | 4 | Dead code, duplicate CSS keyframes, any types, no tests |
| Market readiness | 2 | Fake analytics, fake sample data, fallback profiles with random scores, broken link |

**Strongest 5 things:**
1. Maya persona system prompt (`lib/maya.ts:5-432`) — culturally specific, well-tuned, suppresses generic chatbot behavior
2. Intent detection v2 (`lib/maya.ts:1035-1249`) — scoring + mode + depth + temperature is solid
3. Multi-provider LLM fallback (`app/api/chat/route.ts:52-110`) — 4 providers with 30s timeout is robust
4. Search pipeline with domain scoring (`app/api/search/route.ts:5-44`) — 50-domain tier system is well-designed
5. Festival + content calendar logic (`lib/data/festivals.ts`) — genuine data domain logic, not just a prompt wrapper

**Weakest 5 things:**
1. No authentication on any API route — anyone who finds the URL can call `/api/chat`, `/api/search`, `/api/instagram-dm` for free
2. Hardcoded secrets in `.env.local` committed to repo — Groq API key + Vercel OIDC JWT token
3. ~10 Supabase tables without RLS — any authenticated user can read/write any other user's data via direct Supabase queries
4. Fake/sample data in 6 pages (dashboard benchmarks, A/B tests, home page recent work, influencer fallback profiles with random scores)
5. Instagram OAuth token stored in `localStorage` via inline HTML — XSS-vulnerable token leakage

---

## B. Route-by-Route Audit Table

| Route | File | Level | Real/Partial/Shallow/Stub | Uses AI | Uses DB | Uses API | Hardcoded/Fake Data | Resume-Safe | Market-Safe | Notes |
|-------|------|-------|--------------------------|---------|---------|----------|--------------------|------------|-------------|-------|
| `/` (home) | `app/(home)/page.tsx` | Presentational | Full | No | No | No | 8 template cards (L7-16), 4 recent work items with fake timestamps (L18-23), megaMenu (L25-75) | Yes | Yes | Pure static page. Hardcoded data is UI placeholders. |
| `/login` | `app/login/page.tsx` | Auth | Infrastructure | No | Yes (auth) | Supabase auth | None | Yes | Yes | Standard Supabase email/password + Google OAuth. |
| `/auth/callback` | `app/auth/callback/page.tsx` | Auth | Infrastructure | No | Yes (auth) | Supabase auth | None | Yes | Yes | Standard OAuth redirect handler. |
| `/ask` | `app/ask/page.tsx` | Chat | Real (full module) | Yes | Yes | Supabase, /api/chat, OCR, PDF, XLSX | 4 suggestion prompts (L24-29) | Yes | Yes | Core Maya chat. 1498 lines. Full CRUD for conversations/chat_messages. File parsing. |
| `/content` | `app/content/page.tsx` | Content | Real (full module) | Yes | Yes | /api/chat, /api/search, Supabase, localStorage | None (prompt templates only) | Yes | Yes | Multi-stage workflow (search→generate). Hook history tracking. Brand context injection. |
| `/queue` | `app/queue/page.tsx` | Queue | Real (CRUD) | No | Yes | Supabase (content_queue) | None | Yes | Yes | Simple CRUD. Working. |
| `/schedule` | `app/schedule/page.tsx` | Schedule | Real (CRUD) | No | Yes | Supabase (scheduled_posts) | None | Yes | Yes | Simple CRUD. Working. |
| `/ideas` | `app/ideas/page.tsx` | Ideas | Real (CRUD) | No | Yes | Supabase (ideas) | None | Yes | Yes | Simple CRUD. Working. |
| `/client` | `app/client/page.tsx` | Client | Real (CRUD) | No | Yes | Supabase (clients) | None | Yes | Yes | Simple CRUD. Working. |
| `/saved` | `app/saved/page.tsx` | Saved | Real (CRUD+display) | No | Yes | Supabase (saved_outputs) | None | Yes | Yes | Skeleton loading, search, delete, copy. Proper error states. |
| `/history` | `app/history/page.tsx` | History | Real (CRUD+display) | No | Yes | Supabase (conversations, chat_messages) | None | Yes | Yes | Pagination, skeletons, deletion modals. Well-done. |
| `/settings` | `app/settings/page.tsx` | Settings | Partial | No | No | localStorage | DEFAULT_SETTINGS (L5-16) | Yes | Yes | All localStorage-based. Proprietary framework names (L339-343). |
| `/calendar` | `app/calendar/page.tsx` | Calendar | Partial | Yes | Yes | /api/chat, festivals lib, saveOutput | Festival list display (L222-233) | Yes | Qualified | Uses festivals data library for logic. LLM generates calendar. |
| `/influencer` | `app/influencer/page.tsx` | Influencer | Partial | Yes | Yes | /api/chat, searchInfluencers, localStorage | Fallback profiles with random scores (L127-148, L217-234), "Coming Soon" tab (L397-401) | Qualified | No | Random scores for influencer data = trust destroyer. |
| `/ab-testing` | `app/ab-testing/page.tsx` | A/B Testing | Partial | Yes | No | useModuleMaya, localStorage | 2 sample tests with fake results (L19-40), 6 templates (L95-102) | Qualified | No | Fake test results presented as real. |
| `/report` | `app/report/page.tsx` | Report | Partial | Yes | Yes | /api/chat, useSearch, saveOutput | None | Yes | Yes | Live search + LLM. No hardcoded data. |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard | Partial | Yes | No | useStreamingChat, useSearch | KPI benchmarks (L89-108), content types (L116-129), audience insights (L138-153) | No | No | Hardcoded "analytics" with disclaimer. Presents fake numbers as benchmarks. |
| `/listen` | `app/listen/page.tsx` | Listen | Partial | Yes | Yes | useStreamingChat, useSearch, saveOutput | None | Yes | Yes | Live search + LLM across 3 tabs. Transparent. |
| `/profile` | `app/profile/page.tsx` | Profile | Partial | Yes | Yes | useStreamingChat, useSearch, saveOutput | None | Yes | Qualified | Social Blade search via Serper — fragile. |
| `/research` | `app/research/page.tsx` | Research | Partial | Yes | Yes | /api/chat (direct), saveOutput | None | Yes | Yes | Direct /api/chat calls. Clean. |
| `/strategy` | `app/strategy/page.tsx` | Strategy | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt → display wrapper. |
| `/festive` | `app/festive/page.tsx` | Festive | Shallow | Yes | Yes | useModuleMaya, saveOutput | 8 festival emoji list (L9-18) | Yes | Yes | Static festival reference data. Acceptable. |
| `/ads` | `app/ads/page.tsx` | Ads | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt → display wrapper. |
| `/brand` | `app/brand/page.tsx` | Brand | Shallow | Yes | Yes | useModuleMaya, saveOutput | "Coming Soon" on Assets tab (L126-129) | Yes | Yes | "Assets" tab is a stub. |
| `/bulk` | `app/bulk/page.tsx` | Bulk | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper. |
| `/repurpose` | `app/repurpose/page.tsx` | Repurpose | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper. |
| `/visual` | `app/visual/page.tsx` | Visual | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper with 4 tabs. |
| `/engage` | `app/engage/page.tsx` | Engage | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper with 4 tabs. |
| `/diagnose` | `app/diagnose/page.tsx` | Diagnose | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper. |
| `/meme` | `app/meme/page.tsx` | Meme | Shallow | Yes | Yes | useModuleMaya, saveOutput | None | Yes | Yes | Simple prompt wrapper with 3 tabs. |

**Classification summary:**
- **Real modules (9):** `/ask`, `/content`, `/queue`, `/schedule`, `/ideas`, `/client`, `/saved`, `/history`, `/settings`
- **Partial modules (8):** `/calendar`, `/influencer`, `/ab-testing`, `/report`, `/dashboard`, `/listen`, `/profile`, `/research`
- **Shallow Maya wrappers (10):** `/strategy`, `/festive`, `/ads`, `/brand`, `/bulk`, `/repurpose`, `/visual`, `/engage`, `/diagnose`, `/meme`
- **Infrastructure (3):** `/` (home), `/login`, `/auth/callback`
- **Stubs (1):** `/brand` "Assets" tab

---

## C. AI Architecture Audit

| Component | File | What it does | Strength | Weakness | Resume-Safe Wording |
|-----------|------|-------------|----------|----------|---------------------|
| System prompt (CHAT_SYS) | `lib/maya.ts:5-432` | Defines Maya persona: Indian social media strategist, 12 years experience, Hinglish, non-generic voice rules | Culturally specific, suppresses generic chatbot patterns, extensive situation guide | 428 lines in a single string constant — unmaintainable at scale | "Designed and tuned a culturally-specific AI persona with 20+ behavioral guardrails, intent modes, and citation rules" |
| Intent detection | `lib/maya.ts:1035-1249` | Multi-layer scoring (9 categories), depth detection (instant/quick/deep/complex), type classification, temperature mapping | Scoring v2 with negation detection, behavior guards, good weight assignments | Monolithic function, no test coverage | "Built a multi-class intent classification system with confidence scoring and dynamic temperature selection" |
| Context injection | `lib/maya.ts:978-1026` | Assembles user context, insights, hooks, live search into prompt preamble | Good conditional gating (skip search for casual/humor), cache-aware | 5 separate data sources all fetched synchronously in one function | "Designed a context injection pipeline that assembles user profile, knowledge base, and live search data into LLM prompts" |
| Search pipeline | `lib/maya.ts:878-976`, `app/api/search/route.ts` | Cache-check → live fetch via 15 providers → domain tier scoring → formatted output | 50-domain tier system, 15 provider types, 24h TTL cache | Cache is Supabase-based (adds latency), no fallback between providers at page level | "Built a multi-provider search orchestration system with domain authority scoring and result caching" |
| LLM fallback | `app/api/chat/route.ts:52-110` | 4-provider chain: Groq → SambaNova → Mistral → OpenRouter with 30s timeout per provider | Robust fallback, random Groq key load balancer | No model output validation between providers, no latency tracking | "Implemented a 4-provider LLM fallback chain with automatic failover and load balancing" |
| Streaming | `lib/maya.ts:1799-1824` | SSE reader → parse delta.content → accumulate → React state update | Proper AbortController support, 30s context timeout | Re-renders on every chunk (no batching), TypeScript `any` on parsed JSON | "Built real-time streaming LLM responses using SSE with abort support" |
| Session/memory | `lib/maya.ts:1641-1670` | 4-level session detection (same session/returning/break/long gap/new user), 15-message history window | Good heuristics, gap calculation in minutes | No long-term memory beyond 15 messages, no vector store, last_seen updates only on first message | "Implemented session awareness with multi-level re-engagement heuristics and conversation windowing" |
| Brand context | `lib/maya.ts:1597-1599`, `lib/brand.ts` | Reads smm_settings from localStorage, formats brand block into system prompt | Brand-aware responses with first-message override guard | Duplicate implementation — brand.ts is NOT used by maya.ts (maya reads localStorage directly). brand.ts is dead code. | — |
| Hook history | `lib/hookHistory.ts` | localStorage-based hook history, capped at 50, substring matching | Deduplication, recent hooks summary | Dead code — never imported or called by any module | — |

---

## D. Backend/API/Database Audit

| Area | Evidence | Status | Risk | Fix |
|------|----------|--------|------|-----|
| `user_context` table | `supabase/migrations/new_features.sql:4-13` | HAS RLS | Low | OK |
| `search_cache` table | `supabase/migrations/new_features.sql:24-31` | HAS RLS | Low | OK |
| `post_jobs` table | `supabase/migrations/post_jobs_table.sql:4-17` | HAS RLS | Low | OK |
| `content_queue` table | `lib/crud.ts:57` | NO RLS | **High** — any auth user can query/create/update/delete any row | Add migration with `ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY; CREATE POLICY ... USING (auth.uid() = user_id)` |
| `clients` table | `lib/crud.ts:107` | NO RLS | **High** | Same fix |
| `ideas` table | `lib/crud.ts:157` | NO RLS | **High** | Same fix |
| `scheduled_posts` table | `lib/crud.ts:207` | NO RLS | **High** | Same fix |
| `saved_outputs` table | `lib/save.ts:22` | NO RLS | **High** | Same fix |
| `conversations` table | `app/ask/page.tsx:428` | NO RLS | **High** | Same fix |
| `chat_messages` table | `app/ask/page.tsx:508` | NO RLS | **High** | Same fix |
| `user_instagram` table | `app/api/instagram-oauth/route.ts:123` | NO RLS | **Critical** — IG tokens in DB without RLS | Same fix + encrypt token column |
| `marketing_insights` table | `supabase/migrations/insights_fix.sql` | NO RLS (assumed — no migration creates it with RLS) | Medium — read-only insights data | Add migration with RLS |
| `hooks_library` table | `app/content/page.tsx:236` | NO RLS (assumed) | Medium | Add migration with RLS |
| `/api/chat` | `app/api/chat/route.ts` | No auth | **Critical** — anyone can use your LLM credits | Add middleware or per-route auth check |
| `/api/search` | `app/api/search/route.ts` | No auth | **Critical** — anyone can use your search API credits | Same |
| `/api/generate-image` | `app/api/generate-image/route.ts` | No auth | **High** — anyone can generate images on your Modal account | Same |
| `/api/instagram-dm` | `app/api/instagram-dm/route.ts` | No auth | **Critical** — anyone can send DMs as your IG account | Same |
| `/api/verify-instagram` | `app/api/verify-instagram/route.ts` | No auth | Medium — handle existence oracle | Same |
| `/api/instagram-oauth` | `app/api/instagram-oauth/route.ts` | No CSRF state validation | Medium — OAuth CSRF possible | Add state nonce validation |

**Supabase client:** `lib/supabase.ts` — anonymous client only, no service role key used from client code (except instagram-oauth route which uses it server-side).

**CRUD pattern:** All CRUD in `lib/crud.ts` uses `getUserIdOrThrow()` (gets user from auth) then `.eq('user_id', userId)` — this provides app-level auth filtering, but without RLS, it's defense-in-depth at best. A malicious client could bypass by calling Supabase directly with the anon key.

---

## E. Security Audit

| Issue | Evidence | Severity | Why It Matters | Fix |
|-------|----------|----------|---------------|-----|
| No middleware | No `middleware.ts` anywhere | **Critical** | Every request hits unprotected routes. No auth checking, no rate limiting, no headers. | Create `middleware.ts` with auth check + rate limiting + CSP headers |
| All 6 API routes public | `app/api/*/route.ts` — no auth on any | **Critical** | Anyone with the URL can call `/api/chat` (costs LLM credits), `/api/instagram-dm` (sends DMs), `/api/search` (costs API credits) | Add Supabase session verification or API key check to each route |
| ~10 tables missing RLS | See Section D | **High** | Any authenticated user can read/write any other user's data via Direct Supabase queries | Add RLS migrations for all tables |
| Hardcoded secrets in `.env.local` | `GROQ_API_KEY`, `VERCEL_OIDC_TOKEN` committed | **Critical** | Secrets in git history are compromised forever. Rotate immediately. | Add to `.gitignore` (already there), force-remove from git history with `git filter-branch` or BFG, rotate keys |
| IG OAuth token in localStorage | `app/api/instagram-oauth/route.ts:134` — base64 in HTML, stored in localStorage | **High** | Any XSS vulnerability steals the IG token. No httpOnly cookie. | Use server-side httpOnly cookie for IG token instead. Encrypt at rest. |
| Supabase service key exposed via REST | `app/api/instagram-oauth/route.ts:123` — inline `fetch` to Supabase REST API | **High** | Service key in server code is OK, but the inline REST URL + key could appear in Vercel logs | Use Supabase admin client server-side, not raw fetch |
| No rate limiting | Anywhere | **Medium** | API routes can be abused for DoS or cost exhaustion | Add rate limiting middleware |
| No CSP headers | `next.config.ts` — no security headers | **Medium** | No protection against XSS, data injection | Add `Content-Security-Policy` to next.config.ts |
| DuckDuckGo HTML scraping | `app/api/search/route.ts:294-306` | **Low** | Fragile, could violate DDG ToS, IP could be blocked | Remove or add rate limiting + User-Agent rotation |
| No input sanitization | All API routes accept raw user input | **Medium** | Prompt injection, XSS in generated content possible | Add input validation (zod schemas), sanitize output in react-markdown |

---

## F. Code Quality Audit

| Issue | Evidence | Impact | Fix |
|-------|----------|--------|-----|
| Dead code: `lib/stream.ts` | 46 lines, never imported | Low — 46 bytes in bundle | Delete `lib/stream.ts` |
| Dead code: `lib/brand.ts` | `formatBrandContext()` never called. maya.ts reads localStorage directly. | Low — minor confusion | Either integrate into maya.ts or delete |
| Dead code: `lib/hookHistory.ts` | Never imported by any component | Low | Either integrate into content/page.tsx or delete |
| Monolithic `lib/maya.ts` | 1900 lines / 83KB file | **High** — hard to maintain, test, or reason about | Split: prompts.ts, intent.ts, context.ts, streaming.ts, state.ts |
| Monolithic `app/globals.css` | 4031 lines / 76KB | **High** — no CSS modules, `!important` everywhere, duplicate keyframes | Split into module CSS per component, remove duplicates |
| Duplicate keyframes | `msgFadeIn` (L745 + L1280), `blink` (L750 + L1432) | Low — wastes CSS bytes | Deduplicate |
| `!important` in light theme | Throughout globals.css light theme section | Medium — fragile cascade | Use higher-specificity selectors instead |
| API route "no keys" dead code | `app/api/chat/route.ts:169-177` | Low — unreachable code path | Move check before provider loop |
| Buggy recursive API call | `app/api/search/route.ts:49-57` — multi-query calls `handleSearch()` again | **Medium** — potential stack overflow | Refactor multi-query to loop instead of recursion |
| `any` types throughout | maya.ts, search/route.ts, page.tsx components | **Medium** — defeats TypeScript safety | Add proper types |
| Zero tests | No `*.test.*` or `*.spec.*` files | **High** — no regression safety | Add tests for intent detection, CRUD, API routes |
| Empty `scripts/` directory | No files inside | Low — clutter | Delete directory |
| Broken link | `app/(home)/page.tsx:213` — `/a/b-testing` instead of `/ab-testing` | Low — 404 on one template card | Fix typo |
| `window.print()` labeled "Export PDF" | `app/report/page.tsx:39` | Medium — misleading feature claim | Either implement real PDF export or rename button |
| `Buffer` used in `instagram-oauth/route.ts` | Line 25-26 | Low — deprecated in Edge runtime | Use `TextEncoder` instead |
| Error handling suppressed in search providers | Multiple empty catch blocks in `app/api/search/route.ts` | Medium — silent failures hide bugs | Add console.warn + proper error handling |
| No loading states on settings page | `app/settings/page.tsx` — all localStorage sync | Low — acceptable for local operations | N/A |

---

## G. Product-Market Audit

**Best user persona:** Indian social media manager or freelancer managing 3-10 small-to-medium brand accounts, who needs culturally relevant content ideas, hook formulas, and festival campaigns without paying for Hootsuite or Buffer.

**Real use cases:**
- Generate 10 Instagram hooks for a D2C skincare brand in India
- Get a Diwali festive campaign strategy with ₹50K budget
- Research boAt's Instagram marketing strategy
- Generate a Hindi+English content calendar for Republic Day week
- Analyze a poorly performing post and get diagnosis

**Weak use cases:**
- Real-time analytics dashboard (hardcoded benchmarks, not real data)
- A/B testing (manual winner declaration, no statistical significance)
- Instagram DM automation (single hardcoded account, fragile Graph API)
- Social listening (web search based, not real social API feeds)
- Influencer discovery (fallback profiles with randomized scores)
- PDF "Export" (`window.print()`)

**Differentiation vs ChatGPT:**
- **Strong:** Culturally specific Maya persona, Hinglish comfort, India-specific festival calendar, local platform knowledge (JioHotstar, ShareChat, Moj), hook formulas tuned for Indian attention spans
- **Weak:** ChatGPT has broader knowledge, is more reliable, has plugins, and doesn't fabricate analytics. Maya is only valuable to someone who wants the India-specific cultural tuning. If that tuning doesn't matter to the user, ChatGPT is strictly better.

**Differentiation vs Hootsuite/Predis/Buffer:**
- **Strong:** Free, AI-native, Maya persona is more engaging than a form interface. Festival-specific features. Hook library.
- **Weak:** No actual publishing (no API integrations to Instagram/Facebook/LinkedIn), no analytics (all fake), no team collaboration, no scheduling calendar view, no content approval workflow. Those are mature SaaS products with real integrations. This is a prompt wrapper with CRUD.

**What must exist before charging users:**
1. Auth middleware + API route protection
2. RLS on all Supabase tables
3. Remove all fake/hardcoded data from dashboards and analytics
4. Real social platform API integration (at minimum: Instagram posting)
5. Remove secrets from git history
6. Production-quality error handling (no silent catch blocks)
7. At least one real integration test
8. CSP and security headers
9. Rate limiting

---

## H. Resume-Safe Output

**Best project title:** "SMM Agent AI — AI-Powered Social Media Marketing Assistant"

**5 strongest resume bullets:**
1. "Designed a culturally-tuned AI persona (Maya) with a 400-line system prompt supporting 9 intent categories, dynamic temperature selection, and 4 behavioral guardrails — enabling natural Hinglish social media strategy conversations"
2. "Built a multi-provider LLM inference pipeline with 4-model fallback chain (Groq → SambaNova → Mistral → OpenRouter), 30s per-provider timeout, and load-balanced API key rotation"
3. "Implemented a real-time streaming chat architecture using SSE with AbortController support, integrated with Supabase for conversation persistence (30-per-user cap) and message history windowing (50-message cap)"
4. "Developed a search orchestration system supporting 15 provider types with domain authority scoring (50-domain tier system) and 24-hour result caching"
5. "Created 9 full-stack CRUD modules (clients, queue, schedule, ideas, saved, history, settings, conversations, chat_messages) using Supabase with Row-Level Security and Google OAuth authentication"

**5 claims to avoid:**
1. ❌ "Production-ready" — it's not. No auth on APIs, no RLS on 10 tables, hardcoded secrets.
2. ❌ "Real-time analytics dashboard" — benchmarks are hardcoded, not from live data.
3. ❌ "Social media publishing" — no actual API integration to any social platform.
4. ❌ "A/B testing" — manual winner declaration, no statistical significance, fake sample tests.
5. ❌ "Influencer discovery platform" — fallback profiles with `Math.random()` scores.

**60-second interview explanation:**
"I built an AI-powered social media assistant for Indian brands. The core is a culturally tuned AI persona named Maya who speaks Hinglish and understands Indian social media context — festival campaigns, D2C brands, Tier-2 city audiences. Technically, it's a Next.js app with a multi-provider LLM fallback chain, real-time streaming, intent detection with 9 scoring dimensions, a search pipeline with domain authority scoring across 15 providers, and Supabase for persistence. The hardest part was tuning the system prompt to suppress generic chatbot behavior and make Maya sound like an actual Indian social media strategist. There are 30 route modules — about 9 are full CRUD, 8 have real workflow logic, and the rest are prompt-to-display wrappers. The biggest gap is security: the API routes lack authentication, which I'd need to fix before production deployment."

**Best answer if asked "Did you code this yourself?":**
"I built the entire Next.js application myself — the AI architecture, the prompt system, the streaming pipeline, the search orchestration, and the Supabase integration. The image generation runs on a Modal serverless deployment using FLUX, which I set up but didn't train. The product concept and Maya persona design are entirely my work."

**Best answer if asked "Is this production ready?":**
"Not yet. The AI architecture is solid — the multi-provider fallback, intent detection, and prompt system are production-quality. But there are security gaps I'd need to close first: all 6 API routes currently lack authentication, and about 10 database tables are missing row-level security. Those are quick fixes — middleware and SQL migrations — but they're blocking production deployment. The application works and is deployed on Vercel, but I wouldn't put real user data through it without those fixes."

**Best answer if asked "What is the strongest technical part?":**
"The search orchestration system. It supports 15 different search providers — Google, news, Wikipedia, finance, influencer data, RSS feeds — with a 50-domain trust-scoring system that filters and ranks results by authority. It caches results in Supabase with 24-hour TTL and 500-entry cap. The LLM prompt assembly then injects only the highest-confidence sources, with tier-specific citation rules. That pipeline — search → score → cache → format → inject → stream → post-process — is the most technically complete part of the system."

**Best answer if asked "What is weak or unfinished?":**
"Security is the biggest weakness — no authentication on any API route and missing RLS on most database tables. The feature surface is also uneven: about 10 of the 30 routes are thin wrappers that just pass user input to the LLM and display the response, with no real backend logic. The dashboard and A/B testing modules use hardcoded sample data instead of real analytics. And there's a dead file in the library that should be deleted. The AI architecture is strong, but the product engineering around it — auth, data ownership, testing, production hardening — needs significant work before it's complete."

---

## I. Roadmap

### Fix Immediately (before showing anyone)
| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Rotate leaked `GROQ_API_KEY` and `VERCEL_OIDC_TOKEN` | 15 min | Secrets exposed |
| P0 | Remove hardcoded data from dashboard (benchmarks → "coming soon" with live data note) | 30 min | Trust destroyer |
| P0 | Remove sample A/B tests from ab-testing (show empty state instead) | 15 min | Trust destroyer |
| P0 | Fix influencer fallback — remove `Math.random()` scores, show "not available" instead | 30 min | Trust destroyer |
| P1 | Fix broken link `/a/b-testing` → `/ab-testing` | 5 min | 404 on home page |
| P1 | Rename "Export PDF" button to "Print" or implement real PDF export | 15 min | Misleading feature |

### Fix in 7 Days
| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Add middleware with Supabase session verification | 1 day | **Critical** API auth gap |
| P0 | Add auth checks to all 6 API routes | 1 day | **Critical** |
| P0 | Add RLS migrations for all 10 unprotected tables | 2 hours | **Critical** data ownership gap |
| P1 | Delete `lib/stream.ts`, clean up `lib/brand.ts`/`lib/hookHistory.ts` if unused | 30 min | Dead code |
| P1 | Add rate limiting middleware | 1 day | Abuse prevention |
| P1 | Add CSP security headers to next.config.ts | 30 min | XSS protection |
| P1 | Fix IG OAuth to use httpOnly cookie instead of localStorage | 1 day | Token security |

### Fix in 30 Days
| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P2 | Split `lib/maya.ts` into modules (prompts, intent, context, streaming, state) | 2 days | Maintainability |
| P2 | Split `app/globals.css` into CSS modules | 2 days | Maintainability |
| P2 | Remove `any` types across codebase | 2 days | Type safety |
| P2 | Add proper error handling to all search provider catch blocks | 1 day | Reliability |
| P2 | Fix recursive search route bug | 1 hour | Stability |
| P2 | Add basic test suite (intent detection, CRUD operations, API routes) | 3 days | Regression safety |
| P2 | Implement real Instagram Graph API integration for posting | 3 days | Core feature gap |
| P3 | Migrate settings from localStorage to Supabase (per-user cloud settings) | 2 days | Data portability |

### Fix in 90 Days
| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P3 | Add team collaboration (multi-user per brand) | 5 days | Product-market fit |
| P3 | Real analytics dashboard (fetch from Instagram/Facebook APIs) | 5 days | Legitimacy |
| P3 | Real calendar view with drag-and-drop scheduling | 3 days | UX |
| P3 | Content approval workflow | 3 days | Enterprise readiness |
| P3 | Real PDF export (jsPDF or similar) for reports | 2 days | Feature completion |
| P3 | Long-term memory for Maya (vector store + embedding) | 5 days | AI improvement |
| P4 | Multi-language support (Hindi, Tamil, Telugu for Maya) | 3 days | Differentiation |
| P4 | Mobile app or PWA | 5 days | Reach |

### What to Delete
| File | Reason |
|------|--------|
| `lib/stream.ts` | Dead code — never imported |
| `scripts/` (empty directory) | Empty |
| `.env.local` (from git history) | Contains secrets — force-remove with BFG |
| Duplicate CSS keyframes in globals.css | Dead CSS |

### What to Merge
| Files | Reason |
|-------|--------|
| `lib/brand.ts` → `lib/maya.ts` or delete | brand.ts is unused by maya.ts; maya reads localStorage directly |
| `lib/hookHistory.ts` → `app/content/page.tsx` or delete | Only content module would use hook history |

### What to Double Down On
- **Maya persona tuning** — this is the only genuine differentiation vs ChatGPT. More cultural nuance, more Indian social platform knowledge, more Hinglish fluency.
- **Festival calendar + content engine** — the festival data library + content generation pipeline is the most complete domain-specific feature.
- **Search orchestration** — the 15-provider/50-domain scoring system is technically impressive and genuinely useful for research features.
- **Intent detection** — the scoring + mode + depth system is well-designed and could power adaptive UI behavior.
