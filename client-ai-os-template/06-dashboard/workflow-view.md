---
type: dashboard
updated: {{INSTANCIATION_DATE}}
tags: [dashboard, workflows, automation]
view: workflows
---

# 🔄 Vue workflows — {{COMPANY_NAME}}

> État des automatisations et processus de l'AI OS. Définitions dans [`../05-workflows/`](../05-workflows/).

## Workflows actifs

| Workflow | Déclencheur | Cadence | Dernier run | Statut |
|---|---|---|---|---|
| [Onboarding client](../05-workflows/client-onboarding.md) | Nouveau client | à la demande | — | ⚪ |
| [Reporting hebdo](../05-workflows/weekly-reporting.md) | Lundi 08:00 | hebdo | — | ⚪ |
| [Suivi commercial](../05-workflows/sales-follow-up.md) | Lead / relance | événementiel | — | ⚪ |
| [Brief interne](../05-workflows/internal-brief.md) | Début de journée | quotidien | — | ⚪ |
| [Revue de projet](../05-workflows/project-review.md) | Jalon | événementiel | — | ⚪ |
| [Aide à la décision](../05-workflows/decision-support.md) | Décision à prendre | à la demande | — | ⚪ |

Légende statut : 🟢 OK · 🟠 attention · 🔴 échec · ⚪ jamais exécuté.

## Intégrations connectées

| Outil | Statut | Voir |
|---|---|---|
| CRM | ⚪ à configurer | [`../08-integrations/crm/`](../08-integrations/crm/) |
| Slack | ⚪ | [`../08-integrations/slack/`](../08-integrations/slack/) |
| Google Drive | ⚪ | [`../08-integrations/google-drive/`](../08-integrations/google-drive/) |
| Email | ⚪ | [`../08-integrations/email/`](../08-integrations/email/) |
| n8n | ⚪ | [`../08-integrations/n8n/`](../08-integrations/n8n/) |

*Outils du client à intégrer : {{TOOLS}}.*

## Automatisations à venir

- …

---
*Mise à jour par l'agent Opérations.*
