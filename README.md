# Zoho MCP Interactive Manual

An interactive web reference for exploring MCP (Model Context Protocol) tools across the Zoho ecosystem and beyond. Browse every available tool, read service overviews, and discover real-world automation use cases — all in one place.

## Overview

The Zoho MCP Interactive Manual gives developers and AI practitioners a structured, searchable view of every MCP tool exposed by Zoho and connected services. It is designed to complement the Zoho MCP server and help teams quickly identify which tools to use for a given workflow.

- **61 services** covered across Zoho and Beyond Zoho
- **10,817+ MCP tools** documented with names and purposes
- Per-service **About**, **Tool List**, and **Common Usecases** tabs
- Full-text **search** across service names and tool names
- **Light and dark mode** with branded service logos

## Covered Services

### Zoho Services
Bigin, Catalyst by Zoho, Zoho Analytics, Zoho Apptics, Zoho Assist, Zoho Backstage, Zoho Billing, Zoho Bookings, Zoho Books, Zoho Calendar, Zoho Cliq, Zoho CommandCenter, Zoho Commerce, Zoho Connect, Zoho Creator, Zoho CRM, Zoho Dataprep, Zoho Desk, Zoho Directory, Zoho ERP, Zoho Expense, Zoho Inventory, Zoho Invoice, Zoho IoT, Zoho Learn, Zoho Lens, Zoho Mail, Zoho Meeting, Zoho Notebook, Zoho Office Integrator, Zoho One, Zoho PageSense, Zoho Payments, Zoho Payroll, Zoho People, Zoho POS, Zoho Procurement, Zoho Projects, Zoho Quartz, Zoho Recruit, Zoho SalesIQ, Zoho Sheet, Zoho Show, Zoho Sign, Zoho Social, Zoho Sprints, Zoho Survey, Zoho Tables, Zoho Vertical Studio, Zoho Webinar, Zoho WorkDrive, Zoho Writer

### Beyond Zoho Services
BFSI, CloudSpend, EndpointCentral, Log360 Cloud, MDM (Mobile Device Manager Plus), Qntrl, Vani, SDP on Demand, Site 24x7

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
Produces an optimised static bundle in `dist/` and automatically writes `dist/.catalyst/slate-config.toml` for Slate deployment.

## Deploying to Catalyst Slate

```bash
pnpm build
catalyst deploy slate
```

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
│   │   └── BeyondZohoServicesPage.tsx
│   └── App.tsx                          # Home / landing page
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

## Recent Updates (July 2026)

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
- **Responsive** — works on desktop and tablet

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
