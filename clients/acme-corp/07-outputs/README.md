---
type: index
updated: 2026-06-05
tags: [outputs]
---

# 📤 Outputs — Acme Corp

Les **livrables générés** par l'AI OS. Tout ce que produisent les skills et workflows atterrit ici.

| Dossier | Produit par | Skill / Workflow |
|---|---|---|
| [`reports/`](reports/) | Agent Reporting | [`create-report`](../04-skills/create-report.md), [`weekly-reporting`](../05-workflows/weekly-reporting.md) |
| [`proposals/`](proposals/) | Agent Ventes | [`generate-proposal`](../04-skills/generate-proposal.md) |
| [`audits/`](audits/) | Agent Stratège | [`audit-client`](../04-skills/audit-client.md) |
| [`action-plans/`](action-plans/) | Stratège / Opérations | [`create-action-plan`](../04-skills/create-action-plan.md) |
| [`documentation/`](documentation/) | Tous | synthèses, CR, guides |

## Conventions
- Nom : `Titre En Clair AAAA-MM-JJ.md`.
- Frontmatter : `type`, `updated`, `tags`, `status: draft | final`.
- Un livrable **final** ne se modifie plus : on en crée une nouvelle version datée.
- Les livrables ne sont pas la source de vérité — la connaissance durable va dans le [company-brain](../01-company-brain/).
