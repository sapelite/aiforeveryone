---
type: workflow
updated: 2026-06-05
tags: [workflow, reporting]
trigger: Chaque lundi 08:00 (ou à la demande)
agents: [reporting-agent]
cadence: hebdomadaire
---

# Workflow — Reporting hebdomadaire

Le point d'activité de la semaine, automatisé.

## Déclencheur

Cadence hebdomadaire (ex. lundi matin) ou demande explicite.

## Étapes

1. **Collecte** *(Reporting)* — récupérer les données de la semaine via [`../08-integrations/`](../08-integrations/) (CRM, sheets, etc.).
2. **Calcul des KPI** *(Reporting)* — comparer aux KPI de référence du [`../06-dashboard/command-center.md`](../06-dashboard/command-center.md).
3. **Rédaction** *(Reporting)* — [`../04-skills/create-report.md`](../04-skills/create-report.md) : 3-5 insights + alertes.
4. **Mise à jour des vues** *(Reporting)* — rafraîchir [`../06-dashboard/daily-view.md`](../06-dashboard/daily-view.md) et [`team-view.md`](../06-dashboard/team-view.md).
5. **Diffusion** *(Reporting)* — préparer le message de synthèse pour l'équipe (envoi via [`../08-integrations/slack/`](../08-integrations/slack/) ou [`email/`](../08-integrations/email/) après validation).

## Sorties

- Rapport hebdo dans [`../07-outputs/reports/`](../07-outputs/reports/).
- Dashboard à jour.

## Critère de fin

Rapport publié, alertes signalées, actions recommandées partagées.
