# Zoho MCP Interactive Manual

An interactive web reference for exploring MCP (Model Context Protocol) tools across the Zoho ecosystem and beyond. Browse every available tool, read service overviews, and discover real-world automation use cases — all in one place.

## Overview

The Zoho MCP Interactive Manual gives developers and AI practitioners a structured, searchable view of every MCP tool exposed by Zoho and connected services. It is designed to complement the Zoho MCP server and help teams quickly identify which tools to use for a given workflow.

- **77 services** covered across Zoho (65) and Beyond Zoho (12)
- **16,288 MCP tools** documented with names and purposes
- **21 Progressive MCP compatible services**, browsable as a tile grid and tagged on their service pages
- Per-service **About**, **Tool List**, and **Common Usecases** tabs
- Full-text **search** across service names and tool names
- **Light and dark mode** with branded service logos

## Covered Services

### Zoho Services
Bigin, Catalyst by Zoho, Zoho Analytics, Zoho Analytics Plus, Zoho Apptics, Zoho Assist, Zoho Backstage, Zoho Billing, Zoho Bookings, Zoho Books, Zoho Calendar, Zoho Campaigns, Zoho Cliq, Zoho CommandCenter, Zoho Commerce, Zoho Community Spaces, Zoho Connect, Zoho Contracts, Zoho Creator, Zoho CRM, Zoho Dataprep, Zoho Desk, Zoho Directory, Zoho ERP, Zoho Expense, Zoho Forms, Zoho FSM, Zoho Inventory, Zoho IoT, Zoho Learn, Zoho Lens, Zoho Logs, Zoho Mail, Zoho Meeting, Zoho Notebook, Zoho Office Integrator, Zoho One, Zoho PageSense, Zoho Payments, Zoho Payroll, Zoho People, Zoho POS, Zoho Procurement, Zoho Projects, Zoho Quartz, Zoho Recruit, Zoho Repository, Zoho RouteIQ, Zoho SalesIQ, Zoho Scanner, Zoho Sheet, Zoho Show, Zoho Sign, Zoho Sites, Zoho Social, Zoho Solo, Zoho Sprints, Zoho Survey, Zoho Tables, Zoho Vertical Studio, Zoho Voice, Zoho Webinar, Zoho Workdrive, Zoho Writer, Zoho ZiaAgents

### Progressive MCP Compatible Services
These can be added to a Progressive MCP server. They are listed at `/#/progressive-mcp-services` and carry a "Progressive MCP Server Compatible" tag on their service pages:

Zoho CRM, Zoho Cliq, Zoho Desk, Zoho Books, Zoho POS, Zoho Scanner, Zoho Show, Zoho Sites, Zoho Sprints, Zoho Analytics Plus, Zoho Solo, Zoho Analytics, Zoho Campaigns, Zoho CommandCenter, Zoho Forms, Zoho Notebook, Zoho Quartz, Zoho Social, Zoho Contracts, Zoho Backstage, Zoho People

### Beyond Zoho Services
These can only be configured in Custom MCP servers:

Arattai Business, BFSI, CloudSpend, EndpointCentral, Log360Cloud, MDM, Qntrl, SaaS Manager Plus, SDP on Demand, Site 24x7, TrainerCentral, Vani

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix primitives) |
| Routing | React Router v7 |
| Package manager | pnpm |
| Hosting | Catalyst by Zoho — Slate |
| Built using | Om.AI |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Install dependencies
```bash
cd code
pnpm install
```

### Run locally
```bash
pnpm dev
```
Opens at `http://localhost:5173`

### Build for production
```bash
pnpm build
```
The build runs, in order:
1. `tsc -b` type check
2. `scripts/check-usecases.mjs`, which fails the build if any Common Usecase references a tool that is not in that service's tool list
3. `vite build`, the static bundle in `dist/`
4. `scripts/generate-site-files.ts`, which writes `dist/llms-full.txt` and `dist/sitemap.xml` and a crawler-readable service list into `dist/index.html`
5. `dist/.catalyst/slate-config.toml` for Slate deployment

### Preview the production build
```bash
pnpm build
pnpm preview -- --port 4173
```
Serves `dist/` (the exact folder Slate deploys) at `http://localhost:4173`.

## Deploying to Catalyst Slate

```bash
pnpm build
catalyst deploy slate zoho-mcp-manual -m "<short message>"
```

> Keep the `-m` message short. A long message fails with `HTTP Error: 400, Please check if the length of the input is in the correct range`.

> **One-time setup:** Slate must be activated in the Catalyst console before the first deploy — Console → your project → Slate → *Start Exploring*.

The live deployment URL follows the pattern:
```
https://<project-domain>.onslate.in
```

## Project Structure

```
code/
├── public/             # App-level logos and icons
├── functions/
│   └── asset_manager/  # Catalyst function serving service logos from CDN
├── src/
│   ├── components/
│   │   ├── ZohoServicePanel.tsx         # Zoho services browser
│   │   ├── ThirdPartyServicePanel.tsx   # Beyond Zoho services browser
│   │   └── ui/                          # shadcn/ui primitives
│   ├── pages/
│   │   ├── ZohoServicesPage.tsx
│   │   ├── BeyondZohoServicesPage.tsx
│   │   └── ProgressiveServicesPage.tsx  # Progressive MCP compatible service tiles
│   ├── lib/
│   │   ├── catalog.ts                   # Service and tool totals for the homepage counters
│   │   ├── progressive.ts               # The Progressive MCP compatible service list (edit here only)
│   │   └── slug.ts                      # Service label → URL slug
│   └── App.tsx                          # Home / landing page
├── scripts/
│   ├── check-usecases.mjs     # Build-time usecase/tool reference check
│   └── generate-site-files.ts # Build-time llms-full.txt, sitemap.xml and crawler list
├── sync-tools.mjs       # Official tool to sync a service's tool list from a JSON spec
├── automation-scripts/  # Python utilities for batch operations and maintenance
│   ├── README.md            # Documentation for automation scripts
│   ├── check_all.py         # Check sync status for multiple services
│   ├── sync_all_services.py # Sync multiple services in batch
│   ├── check_usecases.py    # Validate removed tools aren't used in usecases
│   └── fix-newlines.py      # Fix newline formatting issues in tool descriptions
├── catalyst.json        # Catalyst Slate + Functions configuration
└── package.json
```

## Developer Utilities

### sync-tools.mjs (Official Tool)
The main tool for syncing individual service tool definitions:
```bash
node sync-tools.mjs --service <serviceId> --file <path-to-json> [--deploy]
```

### Python Utilities (automation-scripts/)
Python scripts for batch operations and maintenance tasks:

- **check_all.py** - Check sync status for multiple services at once
- **sync_all_services.py** - Sync multiple services in a single batch operation
- **check_usecases.py** - Validate that removed tools aren't referenced in usecases
- **fix-newlines.py** - Fix newline/formatting issues in tool descriptions

See [automation-scripts/README.md](automation-scripts/README.md) for detailed usage instructions.

## Recent Updates (November 2026)

- Added the **Progressive MCP Compatible Services** page (`/#/progressive-mcp-services`): 21 services as tiles that enlarge on hover, show an "Explore MCP tool list" button and open that service's tool list
- Added a **Progressive MCP Server Compatible** tag beside the service name on each of those 21 service pages
- Homepage: the Zoho Services card now has two buttons, **MCP Services** and **Progressive MCP Services**, and a third counter tile shows the **Progressive MCP Compatible** count between Services and Total Tools
- Added **Zoho Contracts** as a new Zoho service (38 tools, 3 usecases)
- Moved **Analytics Plus** from Beyond Zoho into Zoho Services as **Zoho Analytics Plus**; the old Beyond Zoho link redirects to the new page
- Updated the Beyond Zoho card text: these services can only be configured in Custom MCP servers
- Homepage totals are now computed from the tool lists: **77 services**, **16,288 tools**

## Earlier Updates (July 2026)

- Added **Zoho Quartz** as a new service (3 tools) — privacy-first issue management and visual feedback tool; covers `getFeedbackDetails`, `getFeedbackConsoleLogs`, and `getFeedbackNetworkRequests` with 3 real-world usecases
- Added **BFSI** as a new Beyond Zoho service (120 tools) — low-code platform for building financial services applications; covers modules, definitions, rules, invokers, relays, auth services, and variables with 3 real-world usecases
- Synchronized **9 services** against their latest JSON specs: ZohoAnalytics (26 tools), ZohoBookings (31), ZohoCreator (45), ZohoDesk (306), ZohoNotebook (56), ZohoPayroll (184), ZohoBilling (455), SDP on Demand (138), ZohoCRM (1204)
- Updated homepage statistics to reflect current totals: **61 services**, **10,817 tools**
- Synchronized **Zoho Cliq** to 454 tools — added 152 new tools (channels, reminders, events, roles, departments), removed 64 legacy extension/datastore tools, updated 15 descriptions
- Added **10 advance payment tools** to **Zoho Expense** (total: 168 tools) — attachment handling, approval, recall, reject, submit, and void operations
- Added **Zoho Office Integrator** to the services list (32 tools)
- Added **Zoho PageSense** as a new service (13 tools) — covering projects, goals, portals, and web analytics reports
- Removed **23 duplicate tool entries** from **Catalyst by Zoho** — tool list now has 176 unique entries, matching the official specification
- Added **39 QuickML tools** to **Catalyst by Zoho** (total: 176 tools) — covering QuickML datasets, models, pipelines, endpoints, and predictions

## Features

- **Search** — filter services and tools in real time from any page
- **Collapsible sidebar** — more room for content when browsing tools
- **Common Usecases** — step-by-step scenarios showing which tools to chain together for real tasks
- **Progressive MCP tiles** — browse the Progressive MCP compatible services as a tile grid
- **Responsive** — works on desktop, tablet and phone

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## Live Application

[https://zoho-mcp-manual-tool-guide.onslate.in](https://zoho-mcp-manual-tool-guide.onslate.in/)
