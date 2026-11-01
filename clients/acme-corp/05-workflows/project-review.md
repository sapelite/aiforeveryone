---
type: workflow
updated: 2026-11-01
tags: [workflow, project]
trigger: Jalon atteint / revue planifiée
agents: [operations-agent, reporting-agent, strategist-agent]
---

# Workflow — Revue de projet

Faire le point sur un projet : avancement, écarts, décisions.

## Déclencheur

Jalon atteint, revue périodique, ou dérive détectée.

## Étapes

1. **État d'avancement** *(Opérations)* — comparer le réalisé au plan d'action ([`../07-outputs/action-plans/`](../07-outputs/action-plans/)).
2. **Mesure** *(Reporting)* — KPI du projet vs objectifs.
3. **Écarts & causes** *(Opérations)* — ce qui dérape et pourquoi.
4. **Décisions** *(Stratège)* — arbitrages nécessaires → [`decision-support.md`](decision-support.md) si besoin.
5. **Mise à jour du plan** *(Opérations)* — ajuster jalons et tâches.
6. **Compte-rendu** *(Reporting)* — [`../04-skills/summarize-meeting.md`](../04-skills/summarize-meeting.md) si revue en réunion.

## Sorties

- Plan d'action mis à jour.
- CR de revue + décisions consignées dans [`../01-company-brain/decisions/`](../01-company-brain/decisions/).

## Critère de fin

Avancement clair, écarts traités, prochaines actions assignées.
