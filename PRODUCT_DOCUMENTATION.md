# SMM Agent AI — Product Documentation Report

---

## 1. Product Overview

**SMM Agent AI** is an India-first AI-powered social media marketing assistant. It is a web application that helps social media professionals — freelancers, agencies, D2C brand marketers, and content creators — plan, research, create, and manage social media content from a single unified workspace.

### Who is it built for?

- **Indian social media managers** at D2C brands, startups, and agencies
- **Freelance social media strategists** managing multiple clients
- **Agency owners** handling content pipelines for 5-20+ brands
- **D2C brand founders** who manage their own social presence
- **Content creators** who need strategy and research support

### What problem does it solve?

Indian social media professionals typically juggle 5-10 tools: ChatGPT for content, Google for research, Canva for visuals, spreadsheets for planning, separate tools for competitor analysis, influencer discovery, scheduling, and reporting. There is no single tool that understands Indian marketing context — festival seasons, Hinglish content, tier-2 city audiences, ₹ budgets, Indian brand case studies, and region-specific social media behavior.

SMM Agent AI consolidates these workflows into one platform with an AI assistant (Maya) that understands Indian social media marketing deeply.

### Why it matters

The Indian social media management market is dominated by global tools (Hootsuite, Buffer, Sprout Social) that treat India as a generic market and AI tools (ChatGPT, Claude) that give generic advice. An India-first tool that understands Diwali campaigns, Hinglish hooks, tier-2 audience psychology, and ₹-based pricing fills a genuine gap.

---

## 2. Core Purpose

The application serves five core purposes:

1. **Unified workspace** — Replace 5-10 disconnected tools with one platform for research, content, strategy, and scheduling
2. **India-native AI assistance** — An AI (Maya) trained on Indian social media marketing patterns, not generic global advice
3. **Practical daily-use modules** — Bite-sized tools for specific tasks (write a hook, research a competitor, plan a festival campaign) rather than a blank chat interface
4. **Workflow continuity** — Research flows into content, content flows into scheduling, ideas flow into execution — all within the same platform
5. **Multi-client capability** — Agency-specific features for managing multiple brands, client profiles, and saved outputs per client

---

## 3. Complete Feature Breakdown

### 3.1 Maya Chat — The Core AI Assistant

| Aspect | Detail |
|--------|--------|
| **What it does** | Conversational AI assistant for social media marketing. Answers questions, generates content, does research, creates strategies. |
| **Who uses it** | All users — the primary interface for AI interaction |
| **Input** | Natural language questions (text + file attachments: PDF, DOCX, images for OCR, Excel, CSV) |
| **Output** | Streaming AI response with inline citations, markdown formatting |
| **Problem solved** | Replaces ChatGPT for marketing work — Maya gives India-specific answers, not generic global advice |

*Implementation: Uses `useMaya` hook from `lib/maya.ts` (1870 lines, 83KB) with 7-dimensional intent scoring, dynamic temperature (10 modes), Hindi ownership context extraction, session awareness, Jaccard repeat detection, and 500+ lines of system prompt.*

### 3.2 Content Writer (/content)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates social media content — captions, hooks, hashtags, threads |
| **Who uses it** | Content creators, social media managers |
| **Input** | Format (Reel caption, post, story), platform, niche, audience, topic, tone |
| **Output** | AI-generated content with specific format, tone, and platform optimization |
| **Problem solved** | Eliminates writer's block and speeds up daily content production |

*Implementation: 701 lines. Custom 3-step pipeline — library lookup + live search + LLM generation. Four tabs: write, hooks, hashtags, thread.*

### 3.3 Strategy & Audit (/strategy)

| Aspect | Detail |
|--------|--------|
| **What it does** | Creates comprehensive social media strategies and audits |
| **Who uses it** | Strategists, agency owners, brand managers |
| **Input** | Business description (industry, target audience, goals) |
| **Output** | Full strategy: audience analysis, content pillars, posting schedule, growth tactics |
| **Problem solved** | Replaces hours of manual research and strategy document creation |

### 3.4 Research Intel (/research)

| Aspect | Detail |
|--------|--------|
| **What it does** | Market research, competitor analysis, audience insights, trend analysis |
| **Who uses it** | Strategists, brand managers |
| **Input** | Industry, competitor name, audience demographics, niche |
| **Output** | Data-backed research report with sources |
| **Problem solved** | Eliminates manual research across multiple sources |

### 3.5 Content Calendar (/calendar)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates monthly content calendars with festival awareness |
| **Who uses it** | Content managers, social media managers |
| **Input** | Brand, month, posting frequency, content pillars |
| **Output** | Day-by-day content calendar, exportable as text |
| **Problem solved** | Replaces spreadsheet-based planning with AI-generated calendars |

*Implementation: Integrates `INDIAN_FESTIVALS_2026` data from `lib/data/festivals.ts` — 25 festivals across the year. Supports text export.*

### 3.6 Festival Campaigns (/festive)

| Aspect | Detail |
|--------|--------|
| **What it does** | Creates India-specific festival marketing campaigns |
| **Who uses it** | Brand marketers, social media managers |
| **Input** | Brand info, festival, budget, goals |
| **Output** | Festival campaign plan with content ideas, timeline, budget allocation |
| **Problem solved** | Indian festivals require specific cultural knowledge — generic tools miss this entirely |

### 3.7 Influencer Discovery (/influencer)

| Aspect | Detail |
|--------|--------|
| **What it does** | Finds and analyzes influencers for brand collaborations |
| **Who uses it** | Influencer marketing managers, agency teams |
| **Input** | Niche, platform, city, tier (nano/micro/mid/macro) |
| **Output** | List of potential influencers with audience analysis and pitch suggestions |
| **Problem solved** | Manual influencer discovery across platforms is time-consuming |

### 3.8 Social Listening (/listen)

| Aspect | Detail |
|--------|--------|
| **What it does** | Brand mention monitoring, newsjacking opportunities, sentiment analysis |
| **Who uses it** | Community managers, brand managers |
| **Input** | Brand name, industry, competitors, city |
| **Output** | AI-generated monitoring summary, content ideas, sentiment assessment |
| **Problem solved** | Small teams can't afford dedicated social listening tools |

### 3.9 Ad Copy (/ads)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates advertising copy for Meta, Google, and LinkedIn ads |
| **Who uses it** | Performance marketers, ad buyers |
| **Input** | Product, platform, audience, goal, budget |
| **Output** | Ad copy variants with headlines, descriptions, CTAs |
| **Problem solved** | Speeds up ad creative testing |

### 3.10 Engagement (/engage)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates engagement replies, DM scripts, crisis response templates |
| **Who uses it** | Community managers, social media managers |
| **Input** | Scenario, platform, brand voice, audience |
| **Output** | Reply drafts, DM sequences, crisis communication templates |
| **Problem solved** | Reduces response time for common engagement scenarios |

### 3.11 Post Diagnosis (/diagnose)

| Aspect | Detail |
|--------|--------|
| **What it does** | Analyzes why a post underperformed and suggests improvements |
| **Who uses it** | Content creators, social media managers |
| **Input** | Post description, platform, metrics, audience |
| **Output** | Performance analysis with specific improvement recommendations |
| **Problem solved** | Turns failed posts into learning opportunities rather than guesswork |

### 3.12 A/B Testing (/ab-testing)

| Aspect | Detail |
|--------|--------|
| **What it does** | Creates A/B test variants for content and ads |
| **Who uses it** | Performance marketers, content strategists |
| **Input** | Control content, variable to test (hook, format, CTA, visual) |
| **Output** | Multiple variants with hypothesis and measurement criteria |
| **Problem solved** | Structured approach to content testing |

### 3.13 Bulk Content Generation (/bulk)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates multiple content pieces in one request (10+ posts) |
| **Who uses it** | Agencies, content teams with high volume needs |
| **Input** | Brand, niche, platform, quantity, content types |
| **Output** | Multiple content pieces in structured format |
| **Problem solved** | Volume content production for multi-client agencies |

### 3.14 Queue & Schedule (/queue, /schedule)

| Aspect | Detail |
|--------|--------|
| **What it does** | Basic content queue and scheduling CRUD |
| **Who uses it** | Social media managers, content managers |
| **Input** | Content, platform, scheduled time, status |
| **Output** | Stored records in Supabase with status tracking |
| **Problem solved** | Basic content pipeline management |

*Note: These are near-identical CRUD implementations without actual publishing automation. No integration with Instagram/Facebook/Linkedin APIs for auto-publishing.*

### 3.15 Ideas Bank (/ideas)

| Aspect | Detail |
|--------|--------|
| **What it does** | Stores and manages content ideas with status tracking |
| **Who uses it** | Content teams, social media managers |
| **Input** | Title, description, platform, category |
| **Output** | Organized list of ideas with status (raw → developed → scheduled) |
| **Problem solved** | Centralized idea repository so good ideas don't get lost |

### 3.16 Clients (/client)

| Aspect | Detail |
|--------|--------|
| **What it does** | Manages multiple client profiles for agencies |
| **Who uses it** | Agency owners, freelance SMM managers |
| **Input** | Client name, platform, niche, status |
| **Output** | Organized client list with per-client context |
| **Problem solved** | Multi-client management without spreadsheet tracking |

### 3.17 Saved Outputs (/saved)

| Aspect | Detail |
|--------|--------|
| **What it does** | Stores AI-generated content by module for later reference |
| **Who uses it** | All users |
| **Input** | Content from any module |
| **Output** | Searchable, filterable history of generated outputs |
| **Problem solved** | AI outputs are ephemeral — this preserves them |

### 3.18 Conversation History (/history)

| Aspect | Detail |
|--------|--------|
| **What it does** | Stores and retrieves past Maya chat conversations |
| **Who uses it** | All users |
| **Input** | Chat messages |
| **Output** | Organized conversation history with search |
| **Problem solved** | Previous AI conversations are preserved for reference |

### 3.19 Reporting (/report)

| Aspect | Detail |
|--------|--------|
| **What it does** | Generates performance, competitor, audience, and content reports |
| **Who uses it** | Agency owners, brand managers |
| **Input** | Brand, platform, period, report type |
| **Output** | AI-generated report with search data, printable/exportable |
| **Problem solved** | Quick report generation for client reporting |

### 3.20 Dashboard (/dashboard)

| Aspect | Detail |
|--------|--------|
| **What it does** | High-level overview of social media performance |
| **Who uses it** | All users |
| **Input** | None (hardcoded KPIs) |
| **Output** | Dashboard cards with follower counts, engagement rates, post volume |
| **Problem solved** | At-a-glance performance snapshot |

*Note: All KPIs are hardcoded. No live data connections to Instagram/Facebook APIs.*

### 3.21 Settings (/settings)

| Aspect | Detail |
|--------|--------|
| **What it does** | User preferences for Maya behavior |
| **Who uses it** | All users |
| **Input** | Name, platform, tone, quality mode, expert prompt, framework |
| **Output** | Persisted settings in localStorage, injected into every Maya prompt |
| **Problem solved** | Customizes Maya's behavior per user preference |

### 3.22 Brand Kit (/brand)

| Aspect | Detail |
|--------|--------|
| **What it does** | Brand asset management and style guide |
| **Who uses it** | Brand managers, agency teams |
| **Input** | Brand name, colors, voice, visual guidelines |
| **Output** | *(not fully implemented — stub page)* |
| **Problem solved** | Centralized brand reference for multi-client agencies |

*Note: Implemented as a stub — uses `ComingSoon.tsx` component behavior but has form fields.*

---

## 4. AI Workflow Explanation

### 4.1 The Maya AI Engine

Maya is the core AI assistant. Here is how it processes a user request end-to-end:

**Step 1 — Message Reception**
User types a message (optionally with file attachments) and clicks send. The message enters the `useMaya` hook in `lib/maya.ts`.

**Step 2 — Context Fetching (Knowledge Injection)**
Before the AI is called, the system gathers context from multiple sources:

1. **User brand profile** — Queries Supabase `user_context` table for stored business type, audience, goals
2. **Insights database** — Calls `search_insights()` RPC for vector-search relevance matching
3. **Hook templates** — Calls `search_hooks()` RPC for relevant content hook examples
4. **Live web search** — Calls `/api/search` with context-aware cache (24h TTL) for real-time data
5. **Session awareness** — Checks `last_seen` timestamp to determine first-time vs returning user

**Step 3 — Intent Detection**
The message is analyzed through a 7-dimension intent scoring system:
- Content, Strategy, Research, Humor, Emotional, Image, Career
- Each dimension gets a weighted score based on regex keyword matching
- A mode is selected (HUMOR, CREATIVE, STRATEGY, RESEARCH, CASUAL, etc.) through a priority ladder
- Behavior guards are set (assumption blocker, confidence moderator, tone stabilizer)
- Temperature is set dynamically (0.2 for research → 1.0 for humor)
- Depth level is determined (instant/quick/deep/complex)
- Token allocation is task-based (500 for classification → 8000 for research)

**Step 4 — System Prompt Assembly**
A 500+ line system prompt is constructed from:
- **CHAT_SYS** — Base Maya persona (India's best SMM strategist, 12 years experience, boAt/Mamaearth/Sugar Cosmetics)
- **Time context** — Current IST date/time
- **Mode instruction** — Behavior rules based on detected mode
- **Brand context** — User's stored brand profile (if any)
- **Settings context** — User preferences (platform, tone, framework)
- **Fresh conversation rules** — Session-aware greeting tone
- **Knowledge injection** — Search results, insights, hooks from Step 2
- **Repeat detection** — Jaccard similarity check against conversation history

**Step 5 — AI API Call**
The assembled prompt is sent to `/api/chat`, which:
1. Load-balances across 2 Groq API keys
2. Falls back through 4 providers: Groq (Llama 3.3 70B) → SambaNova → Mistral → OpenRouter
3. Each provider has a 30-second timeout
4. Uses task-optimized token limits (2500-8000 based on task type)

**Step 6 — Streaming Response**
The response is streamed SSE (Server-Sent Events) back to the UI. The `useMaya` hook:
1. Reads chunks from the stream
2. Parses SSE format (`data: {...}`)
3. Accumulates text in state for real-time display
4. On completion, strips dividers (`***`, `====`) and bold markdown
5. Persists the message to Supabase `chat_messages`

**Step 7 — Post-Processing**
- First message triggers `updateLastSeen()` to track session
- Conversation is pruned (keeps last 50 messages)
- User context is auto-extracted from message (business type, audience, goals via Hindi ownership detection)

### 4.2 Search Workflow

The search API (`/api/search`) orchestrates 15+ providers:

1. Receives query + provider preference
2. Routes to appropriate provider (Serper, Exa, GNews, Finnhub, Tavily, custom provider scrapers)
3. Results are scored using `DOMAIN_SCORES` — 40+ Indian domains ranked in 7 tiers
4. High-authority sources (data.gov.in: 10, Inc42: 9, Moneycontrol: 9) ranked above social/user content (Reddit: 0, Twitter: 0)
5. Results are cached with context-aware keys (24h TTL)
6. Returns structured results with tier scores and confidence levels

### 4.3 Quality Controls

- **Jaccard repeat detection** — Prevents answering the same question identically within a conversation
- **Negation detection** — Recognizes when user says "don't write a post" vs "write a post"
- **Behavior guards** — Assumption blocker (don't guess audience), confidence moderator (avoid absolute claims), tone stabilizer (soft start for emotional queries)
- **Content stripping** — Removes markdown dividers and bold formatting from final output
- **Source validation** — Citations must be extracted and rendered as inline badges

---

## 5. India-Specific Intelligence

### 5.1 Hinglish Content Support

- Maya's system prompt instructs: "Hinglish comes naturally — yaar, bilkul, ekdum sahi"
- Greeting rules specify natural Hinglish: "Kya scene hai", "kya chal raha hai", "bol bhai" (not English + token "namaste")
- Hindi word mixing is encouraged throughout responses
- OCR supports Hindi language extraction (`eng+hin` in Tesseract.js)

### 5.2 Indian Festival Calendar

- `lib/data/festivals.ts` contains 25 Indian festivals for 2026
- Festival-aware features: Content Calendar, Festival Campaigns module
- Maya's system prompt includes festival season awareness and campaign templates (Diwali: T-14 BUZZ → T-7 HYPE → T-3 DROP → T-day CLOSE)

### 5.3 Audience Psychology

- Maya's system prompt encodes 3-tier India audience model:
  - **Metro** → aspiration + convenience
  - **Tier-1** → wants premium, needs value justification
  - **Tier-2** → social proof + family approval + price anchor, WhatsApp-first CTA
- `queryType` detection includes `isAudience` for tier-2, tier-3, and vernacular audience patterns

### 5.4 Indian Pricing & Currency

- Maya is instructed to use ₹ (not $), IST (not EST), lakh/crore (Indian numbering)
- Strategy outputs must include ₹ costs
- Ad copy and campaign budgets reference Indian pricing

### 5.5 Indian Brand & Creator Focus

- System prompt references Indian brands: boAt, Mamaearth, Sugar Cosmetics
- Search ranking prioritizes Indian domains: Inc42, Moneycontrol, YourStory, Economic Times, Livemint
- Competitor detection includes Indian brand names: boAt, Nykaa, Mamaearth, Flipkart, Amazon
- Influencer module supports Indian cities and tiers

### 5.6 Indian Cultural References

- Content generation instructions include India-specific pain points: hard water, monsoon, gori skin pressure, dadi ke nuskhe, festival prep, Tier-2 pricing, cricket fever, exam season, chai culture
- Festival campaign module understands Diwali, Holi, Eid, Navratri, Pongal, Onam, etc.

### 5.7 Hindi Ownership Detection

- `updateUserContext()` checks Hindi ownership patterns: "mera brand", "meri company", "hamara product", "hamari startup"
- Prevents saving hypothetical/third-party brand details to user context

---

## 6. Tools and Technologies Used

### Frontend

| Technology | Purpose | Status |
|------------|---------|--------|
| Next.js 16.2.3 | Framework (App Router) | Confirmed in package.json |
| React 19.2.4 | UI library | Confirmed |
| TypeScript | Type safety | Confirmed |
| Tailwind CSS v4 | Styling | Confirmed |
| Recharts | Dashboard charts (hardcoded data) | Confirmed |
| Lucide icons | UI icons | Confirmed in usage |

### Backend

| Technology | Purpose | Status |
|------------|---------|--------|
| Next.js API Routes | Backend API layer | Confirmed |
| Supabase | Database + Auth | Confirmed |
| Modal | External image generation (Python) | Confirmed via `modal_generate.py` |

### AI / ML

| Technology | Purpose | Status |
|------------|---------|--------|
| Groq (Llama 3.3 70B) | Primary AI provider | Confirmed (2 API keys for load balancing) |
| SambaNova (Llama 3.1 405B) | Fallback provider | Confirmed |
| Mistral (Mistral Large) | Fallback provider | Confirmed |
| OpenRouter (Llama 3.3 70B) | Fallback provider | Confirmed |
| Tesseract.js | OCR for image text extraction | Confirmed |
| pdfjs-dist | PDF text extraction | Confirmed |
| mammoth | DOCX text extraction | Confirmed |
| xlsx | Excel parsing | Confirmed |

### Search Providers

| Provider | Purpose | Status |
|----------|---------|--------|
| Serper (Google SERP API) | Primary web search | Confirmed |
| Exa | Secondary search | Key exists |
| GNews | News search | Key exists |
| Finnhub | Stock data | Key exists |
| Tavily | Web search fallback | Key exists |

### Infrastructure

| Technology | Purpose | Status |
|------------|---------|--------|
| Vercel | Hosting/deployment | Confirmed (.vercel config) |
| Supabase | PostgreSQL database + Auth | Confirmed |
| localStorage | Client-side settings storage | Confirmed |
| Environment variables | API keys and secrets | Confirmed |

### Not found in codebase

| Technology | Purpose | Status |
|------------|---------|--------|
| Redis/Memcached | Caching layer | Not found (uses Supabase for cache) |
| Queue workers | Background job processing | Not found (post_jobs table exists but no worker) |
| Monitoring/Error tracking | Sentry, Datadog, etc. | Not found |
| Test framework | Jest, Vitest, Playwright | Not found |
| CI/CD pipeline | GitHub Actions | Not found |
| Docker | Containerization | Not found |

---

## 7. How the App Was Built

### Development Approach

- **AI-assisted development** — The codebase was built with significant AI assistance (Claude, ChatGPT) for planning, coding, debugging, and iteration
- **Product-driven direction** — The creator defined the product vision, specifications, workflows, and validated outputs. AI tools generated and refined the code
- **Iterative refinement** — Features were built, tested, and improved through repeated feedback loops with AI coding assistants
- **Prompt engineering focus** — The core product strength (Maya's India-specific intelligence) comes from extensive prompt engineering rather than model fine-tuning

### How a non-technical creator directed this build

1. **Clear specifications** — Each module was defined by what it should do, who uses it, what inputs/outputs it needs
2. **Workflow design** — The creator mapped real SMM workflows (research → content → schedule) into product requirements
3. **Validation through testing** — Outputs were reviewed for India-specific accuracy, tone, and usefulness
4. **Feedback loops** — Bugs and quality issues were communicated back to AI tools for fixes
5. **Practical scenarios** — Real use cases (Diwali campaign, competitor analysis, Hinglish hooks) drove feature decisions

### Tools used in development

- **Claude** — Code generation, debugging, architecture decisions
- **ChatGPT** — Prompt engineering, content strategy for Maya's system prompt
- **OpenCode** — Testing, code refinement, linting
- **Cursor/Traditional IDE** — Local development environment

---

## 8. Most Important Thing About This App

**The single strongest value proposition is that SMM Agent AI is an India-native, workflow-integrated AI assistant designed specifically for social media marketing — not a generic chatbot.**

What makes it different:

1. **ChatGPT gives generic advice.** Maya knows Indian festivals, ₹ pricing, Hinglish tone, tier-2 audience psychology, and Indian brand case studies. She will never suggest a Thanksgiving campaign to an Indian brand.

2. **Hootsuite/Buffer are schedulers, not AI assistants.** They tell you when to post, not what to post. SMM Agent AI helps you create the content, research it, strategize it, and then manage the pipeline.

3. **Predis.ai generates content but doesn't understand Indian strategy.** SMM Agent AI connects content generation to a strategy workflow — research informs strategy, strategy informs content, content flows into scheduling.

4. **It replaces 5+ tools with one.** Instead of ChatGPT + Google + Canva + Spreadsheets + Hootsuite + Influencer discovery tools, one platform handles research, content, strategy, scheduling, ideas, clients, and reporting.

5. **The unified workflow is the real product.** A user can research a competitor in the research module, use those insights to generate a content calendar in Calendar, write specific posts in Content, store them in Queue/Schedule, and save outputs to Saved — all within one platform with a consistent interface.

---

## 9. Product Differentiation

| Feature | SMM Agent AI | ChatGPT | Hootsuite/Buffer | Sprout Social | Predis.ai |
|---------|-------------|---------|------------------|---------------|-----------|
| India-specific AI | **Deep (festivals, Hinglish, ₹, tier-2)** | Generic global | None | None | Limited |
| Content generation | **Native, India-optimized** | Generic | No | No | Yes |
| Strategy module | **Integrated** | Manual prompt | No | Limited | No |
| Research module | **Integrated with search** | Manual prompt | No | Yes (basic) | No |
| Scheduling | **Basic CRUD** | No | **Core feature** | **Core feature** | Limited |
| Multi-client | **Yes** | No | Yes (paid) | Yes (paid) | No |
| Festival awareness | **Indian festivals built-in** | No | No | No | No |
| Hinglish support | **System-prompt native** | Manual prompt | No | No | No |
| OCR/File parsing | **6 formats** | Limited | No | No | Image only |
| Influencer discovery | **AI-powered** | No | No | Yes (addon) | No |
| Social listening | **Search-based** | No | No | **Yes** | No |
| Ad copy | **Yes** | Manual prompt | No | No | Limited |

### Where SMM Agent AI is genuinely different

1. **India context is not an add-on — it's the foundation.** The system prompt, search ranking, festival calendar, pricing rules, audience model, and brand references are all India-first.

2. **Workflow integration across modules.** Research from the Research module feeds strategy generation, which feeds content creation, which feeds the scheduling pipeline — all within the same platform.

3. **Maya's personality is designed for Indian users.** Not a generic assistant — a "sharp Indian friend who knows marketing" with specific tone rules, cultural references, and behavior patterns.

### Where it falls short vs. established tools

1. **No actual publishing** — Unlike Hootsuite/Buffer, there's no API integration to actually post to Instagram, LinkedIn, or Facebook
2. **No analytics** — Unlike Sprout Social, there's no real data connection to pull actual engagement metrics
3. **No team collaboration** — No multi-user workspaces, approval workflows, or role-based access
4. **No mobile app** — Web-only
5. **No content calendar visualization** — The Calendar module generates text plans, not a drag-and-drop calendar UI

---

## 10. User Journey

### First-time User

1. Signs up via email/password (Supabase Auth)
2. Landed on Home page with template cards and navigation
3. Can immediately use "Ask Maya" chat or explore modules
4. Settings accessible via /settings to set name, platform, tone
5. Brand profile is auto-extracted from conversations as they chat

### Creating a Strategy

1. Opens /strategy
2. Types business description
3. Clicks "Generate Strategy"
4. Maya runs research → compiles strategy → streams response
5. Strategy can be saved to Saved Outputs or copied

### Researching Content

1. Opens /research
2. Selects tab: Market Research, Competitor Analysis, Audience Insights, or Trend Analysis
3. Fills relevant fields (industry, competitor name, audience demographics)
4. Clicks generate — AI performs search + analysis → streams report
5. Output can be saved or used as context in other modules

### Generating Content

1. Opens /content
2. Selects format (Reel caption, Post, Story), platform, niche, topic
3. Sets tone and number of variations
4. Clicks generate — Maya creates platform-optimized content
5. Content can be copied directly or saved

### Managing Clients (Agency Workflow)

1. Opens /client
2. Adds client profiles with name, platform, niche
3. Each client's context flows into Maya responses when working on their projects
4. Saved Outputs can be tagged per client for organized reporting

### Discovering Influencers

1. Opens /influencer
2. Selects niche, platform, city, follower tier
3. System runs search → identifies potential influencers
4. Can analyze specific influencer profiles
5. Gets AI-generated pitch suggestions

### Using Outputs

1. Content generated in any module can be saved to /saved
2. Ideas can be collected in /ideas with status tracking (raw → developed → scheduled)
3. Content can be added to Queue (/queue) or Schedule (/schedule) for pipeline management
4. Reports from /report can be exported as text

---

## 11. Resume / Interview Summary

> *Note: These bullets are designed for a product owner/founder presenting this project to recruiters or interviewers.*

1. **Directed product strategy and specification** for an India-first AI-powered social media marketing platform, defining 22+ integrated modules across research, content, strategy, and workflow management.

2. **Structured AI workflows** for an India-native marketing assistant (Maya) with 7-dimensional intent scoring, dynamic temperature control, context-aware knowledge injection, and Hinglish language support — replacing generic ChatGPT interactions with India-specific marketing intelligence.

3. **Designed end-to-end user workflows** mapping real social media management processes (research → strategy → content creation → scheduling → reporting) into a unified product experience with 22 route-based modules.

4. **Built India-specific AI intelligence** including festival calendar integration (25+ Indian festivals), tier-2 city audience psychology, ₹-based pricing models, Hindi ownership detection, and Indian brand case study references.

5. **Used AI-assisted development tools** (Claude, ChatGPT, OpenCode) to accelerate implementation — directed code generation through specifications, validated outputs through testing, and iterated on quality through structured feedback loops.

6. **Implemented practical product features** including multi-format file parsing (PDF, DOCX, Excel, CSV, images with Hindi OCR), 4-provider AI fallback chain with load balancing, context-aware search caching, and conversation persistence with session awareness.

7. **Demonstrated understanding of AI product workflows** — prompt engineering, system prompt design, context injection pipelines, streaming response handling, error recovery, and output quality validation — without requiring traditional software engineering credentials.

---

## 12. Technical Summary

### Architecture

The application is a **single-page web application** built with Next.js 16 (App Router) and React 19, deployed on Vercel. It uses Supabase as both the database (PostgreSQL) and authentication provider. The AI layer is served through a server-side API proxy that load-balances across multiple LLM providers.

### How data flows

1. **User → Browser** — All UI renders client-side via React components
2. **Browser → Next.js API** — Fetch calls to `/api/*` routes for chat, search, file processing
3. **API → AI Providers** — `/api/chat` proxies requests to Groq/SambaNova/Mistral/OpenRouter with SSE streaming
4. **API → Supabase** — Data persistence for conversations, saved outputs, client records, ideas, scheduled posts
5. **Browser ← Supabase** — Direct client-side queries for CRUD operations (with RLS issues noted below)
6. **Browser → Search APIs** — `/api/search` routes to Serper/Exa/GNews/etc. for live data

### Key architectural decisions

- **Client-side file parsing** — PDF, DOCX, Excel, and image OCR all run in the browser via JavaScript libraries. This means large files can slow down the user's machine but reduces server load.
- **System prompts are client-side** — All AI behavior instructions are assembled in the browser and sent to the API. The API's `systemPrompts` object is empty.
- **Single-file AI engine** — All AI logic (intent detection, context fetching, prompt assembly, streaming, error handling) lives in one 83KB file (`lib/maya.ts`).
- **4-provider fallback** — If Groq fails, the API automatically tries SambaNova → Mistral → OpenRouter in sequence.
- **No middleware** — There is no request-level middleware. API routes are publicly accessible. Auth is handled at the React component level via `<ProtectedRoute>`.

### Storage

- **Supabase PostgreSQL** — 13 tables for conversations, messages, user context, search cache, saved outputs, clients, queue, ideas, scheduled posts, post jobs
- **localStorage** — User settings (name, platform, tone, etc.), Instagram OAuth token
- **No file storage** — Uploaded files are parsed in-browser and discarded. File contents are sent as text in API requests.

---

## 13. Gaps / Missing Items

### Security Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| No RLS on 6 tables | High | `chat_messages`, `saved_outputs`, `clients`, `content_queue`, `ideas`, `scheduled_posts` have no row-level security. Any authenticated user could read/write others' data via direct Supabase queries. |
| No middleware | High | No `middleware.ts`. All API routes (`/api/chat`, `/api/search`, etc.) are publicly accessible with no auth checks. |
| IG token in localStorage | High | Instagram OAuth access token is stored in `localStorage`. Vulnerable to XSS. |
| `.env.local` committed | Medium | Environment variables including API keys are committed to git. |
| Public API routes | Medium | No rate limiting, no request validation on most API routes. |

### Missing Features

| Feature | Status |
|---------|--------|
| Actual social media publishing | Not implemented (no Facebook/Instagram/LinkedIn Graph API posting) |
| Analytics/Insights from real data | Not implemented (all dashboard data is hardcoded) |
| Multi-user / team collaboration | Not implemented |
| Mobile app | Not implemented |
| Content calendar visualization | Not implemented (text-only calendar export) |
| Image/video generation | Partial — `/api/generate-image` exists (proxies to Modal) but no dedicated UI |
| Brand Kit module | Stub — form fields exist but no functional logic |
| Automated publishing from Queue/Schedule | Not implemented (CRUD only, no worker process) |
| Queue ↔ Schedule are duplicates | Near-identical CRUD with no actual automation or differentiation |
| `post_jobs` table has no worker | Schema defines an execution queue with state machine, but nothing processes it |

### Technical Debt

| Issue | Details |
|-------|---------|
| `lib/maya.ts` is 83KB / 1900 lines | Single file handles intent detection, context fetching, prompt assembly, streaming, error handling, and UI state. Should be modularized. |
| `lib/stream.ts` is dead code | Legacy file, never imported anywhere |
| Scoring system is ornamental | `detectIntent()` returns `scores` and `intents` arrays that no upstream code reads |
| Hybrid mode is unreachable | `SCORE_THRESHOLD = 0.65` but no score except emotional can reach 0.65, so `HYBRID_*` mode can never trigger |
| Two parallel classification systems | Binary regex flags and numeric scoring run independently with no unified resolution |
| `systemPrompts` in API is empty | All system prompts are injected client-side. The API's `systemPrompts` object (intended for server-side prompts) is an empty object. |
| No loading/error/not-found pages | Zero `loading.tsx`, `error.tsx`, or `not-found.tsx` files. No error boundaries. |
| 76KB globals.css | All styles in one file. No CSS modules. |

### Product Gaps

| Issue | Impact |
|-------|--------|
| Hardcoded Home page "Recent Work" | New users see fake data |
| Hardcoded Dashboard KPIs | Misleading for evaluation |
| Broken template card links | Some home page cards link to wrong routes (`/a/b-testing` instead of `/ab-testing`) |
| No onboarding flow | First-time users get no guided setup |
| No analytics connection | Dashboards can't show real metrics |
| Social Listening is search-based, not API-based | No real-time monitoring from platform APIs |
| Client module has no per-client strategy context | Client records exist but don't feed into Maya's awareness |

---

## 14. Final Notes

SMM Agent AI is a **functional prototype** with genuine depth in its core AI engine and India-specific intelligence, but significant gaps in production readiness — particularly around security, error handling, and live data integration.

The strongest parts of the product:
- **Maya's India-native AI** — genuinely differentiated from generic AI tools
- **22 integrated modules** — real breadth of coverage for SMM workflows
- **Intent scoring and context injection pipeline** — sophisticated AI architecture
- **Multi-client agency workflow** — addresses a real market need

The weakest parts:
- **Security** — missing RLS, no middleware, exposed keys
- **Production polish** — no error boundaries, no loading states, hardcoded data
- **Actual platform integrations** — no Instagram/Facebook/LinkedIn APIs connected
- **Dead code and technical debt** — unused files, unreachable code paths

The product is **not production-ready** but has a **strong product concept** and differentiated AI capabilities that would be genuinely valuable if the security gaps were closed and platform integrations were built.
