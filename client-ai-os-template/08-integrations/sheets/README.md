---
type: integration
updated: {{INSTANCIATION_DATE}}
tags: [integration, sheets, data]
status: à configurer
---

# Intégration — Google Sheets

> Source de données chiffrées pour les KPI de {{COMPANY_NAME}}.

## Objectif
Lire des données structurées (ventes, finances, suivi) pour alimenter le reporting.

## Authentification
- Méthode : OAuth 2.0 / service account (Google).
- Accès minimal : feuilles explicitement partagées.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lire des plages / onglets | lecture | auto |
| Calculer des KPI | lecture | auto |
| Écrire un récap dans une feuille dédiée | écriture | requise |

## Utilisé par
- Agent **Reporting** · [`create-report`](../../04-skills/create-report.md), [`weekly-reporting`](../../05-workflows/weekly-reporting.md)

## Mappage
- Colonnes ↔ définitions de KPI du [`command-center`](../../06-dashboard/command-center.md).

## Garde-fous
- Ne jamais écraser des données sources.
- Écritures cantonnées à une feuille « AI OS » dédiée.
