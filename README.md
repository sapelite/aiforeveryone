# AI For Everyone

AI For Everyone is a Next.js application for exploring an AI operations workspace. It combines a French and English marketing site and onboarding form with a retro styled dashboard for tasks, agents, integrations, usage, and generated deliverables. The dashboard reads a local, file based company instance, and the server can call Anthropic's API for assistant responses.

This repository includes an example company instance (`clients/acme-corp`) and a reusable knowledge and workflow template (`client-ai-os-template`). The example company and contact details are fictional placeholders. Integration entries and business records in that instance are sample content; they do not indicate live connections or actual customer use.

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS 4
- Anthropic SDK and Claude Agent SDK for assistant responses
- JSON and Markdown files for the example instance and template

## Run locally

Requirements: Node.js compatible with the versions used by the project and npm.

```bash
npm install
cp .env.example .env.local
# Add an Anthropic API key to .env.local to enable API responses.
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`. Open <http://localhost:3000> for the site and <http://localhost:3000/dashboard> for the example dashboard. Without an API key (or an available local Claude Code session), assistant responses may use the app's demo fallback.

## Useful commands

```bash
npm run dev          # Start the development server
npm run build        # Build for production
npm run start        # Serve a production build
npm run lint         # Run ESLint
npm run instantiate -- --input scripts/sample-acme.json
```

The instantiation script copies `client-ai-os-template/` into a client output directory and fills template tokens from the supplied JSON. Review the input and generated files before using them; do not put real personal, customer, or confidential data in examples committed to a public repository.

## Repository layout

- `src/app/` — site pages, dashboard, and API routes
- `src/components/` — shared interface components
- `src/lib/` — application logic, data access, and assistant integration
- `client-ai-os-template/` — reusable Markdown knowledge, agent, workflow, and integration templates
- `clients/acme-corp/` — demonstration instance used by the dashboard
- `scripts/` — instance generation and sample data utilities

## Configuration and security

Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` only in your local environment or deployment secret store. `.env*` files are ignored by Git except `.env.example`. Never commit credentials, production customer data, or private connection details. If a credential was committed in the past, revoke it and review the repository history before making the repository public.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
