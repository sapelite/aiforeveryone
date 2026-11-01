---
type: workflow
updated: 2026-11-01
tags: [workflow, communication]
trigger: Début de journée / kick-off / à la demande
agents: [reporting-agent, strategist-agent]
---

# Workflow — Brief interne

Un point d'équipe condensé : ce qui compte aujourd'hui.

## Déclencheur

Début de journée/semaine, lancement de projet, ou demande de Alex Example.

## Étapes

1. **Collecte de l'état** *(Reporting)* — priorités, alertes et échéances depuis [`../06-dashboard/daily-view.md`](../06-dashboard/daily-view.md).
2. **Priorisation** *(Stratège)* — identifier les 3 sujets prioritaires alignés sur Réduire de 50% le temps de qualification des leads, centraliser la connaissance de l'équipe, et accélérer le reporting hebdomadaire..
3. **Synthèse** *(Reporting)* — rédiger un brief court : où on en est, ce qui bloque, ce qu'on fait aujourd'hui.
4. **Diffusion** *(Reporting)* — partager à l'équipe via [`../08-integrations/slack/`](../08-integrations/slack/) (après validation).

## Format de sortie

```markdown
# Brief — AAAA-MM-JJ
## 🎯 Priorités du jour (max 3)
## ⚠️ Alertes / bloquants
## 📅 Échéances proches
## ✅ Décisions attendues
```

## Critère de fin

Brief partagé, priorités claires pour l'équipe.
