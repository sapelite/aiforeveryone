---
type: index
updated: {{INSTANCIATION_DATE}}
tags: [integrations]
---

# 🔌 Integrations — {{COMPANY_NAME}}

Les connecteurs entre l'AI OS et les outils du client. **Outils déclarés : {{TOOLS}}.**

| Connecteur | Usage | Spec |
|---|---|---|
| CRM | Comptes, deals, pipeline | [`crm/`](crm/) |
| Google Drive | Documents, fichiers | [`google-drive/`](google-drive/) |
| Slack | Communication, briefs, alertes | [`slack/`](slack/) |
| Notion | Base de connaissance, projets | [`notion/`](notion/) |
| Sheets | Données chiffrées, KPI | [`sheets/`](sheets/) |
| Email | Envoi & réception | [`email/`](email/) |
| n8n | Orchestration / automatisation | [`n8n/`](n8n/) |

## Principes

1. **Moindre privilège** : chaque connecteur demande l'accès minimal nécessaire.
2. **Lecture libre, écriture validée** : lire est automatique ; écrire/envoyer requiert validation (voir [`../00-system/operating-rules.md`](../00-system/operating-rules.md)).
3. **Statut explicite** : chaque spec indique si l'intégration est `à configurer`, `active`, ou `désactivée`.
4. **Traçabilité** : toute action sortante est journalisée.

> Ces fiches sont des **spécifications**. L'implémentation (clés API, webhooks) se fait à l'instanciation, hors du dépôt versionné (secrets jamais commités).
