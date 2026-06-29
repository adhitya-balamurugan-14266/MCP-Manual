# Zoho MCP Interactive Manual

An interactive web reference for exploring MCP (Model Context Protocol) tools across the Zoho ecosystem and beyond. Browse every available tool, read service overviews, and discover real-world automation use cases — all in one place.

## Overview

The Zoho MCP Interactive Manual gives developers and AI practitioners a structured, searchable view of every MCP tool exposed by Zoho and connected services. It is designed to complement the Zoho MCP server and help teams quickly identify which tools to use for a given workflow.

- **57 services** covered across Zoho and Beyond Zoho
- **8,787+ MCP tools** documented with names and purposes
- Per-service **About**, **Tool List**, and **Common Usecases** tabs
- Full-text **search** across service names and tool names
- **Light and dark mode** with branded service logos

## Covered Services

### Zoho Services
Bigin, Catalyst by Zoho, Zoho Analytics, Zoho Apptics, Zoho Assist, Zoho Backstage, Zoho Billing, Zoho Bookings, Zoho Books, Zoho Calendar, Zoho Cliq, Zoho CommandCenter, Zoho Commerce, Zoho Connect, Zoho Creator, Zoho CRM, Zoho Dataprep, Zoho Desk, Zoho Directory, Zoho ERP, Zoho Expense, Zoho Inventory, Zoho Invoice, Zoho IoT, Zoho Learn, Zoho Lens, Zoho Mail, Zoho Meeting, Zoho Notebook, Zoho One, Zoho Payments, Zoho Payroll, Zoho People, Zoho POS, Zoho Procurement, Zoho Projects, Zoho Recruit, Zoho SalesIQ, Zoho Sheet, Zoho Show, Zoho Sign, Zoho Social, Zoho Sprints, Zoho Survey, Zoho Tables, Zoho Vertical Studio, Zoho Webinar, Zoho WorkDrive, Zoho Writer

### Beyond Zoho Services
CloudSpend, EndpointCentral, Log360 Cloud, MDM (Mobile Device Manager Plus), Qntrl, Vani, SDP on Demand, Site 24x7

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
├── sync-tools.mjs       # Developer script to sync a service's tool list from a JSON spec
├── catalyst.json        # Catalyst Slate + Functions configuration
└── package.json
```

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
