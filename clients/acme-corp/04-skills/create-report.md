---
type: skill
updated: 2026-06-05
tags: [skill, reporting]
used-by: [reporting-agent, support-agent]
---

# Skill — Créer un rapport

Produire un rapport clair, sourcé et orienté décision pour Acme Corp.

## Quand l'utiliser

- Rapport périodique (hebdo, mensuel) ou ad hoc.
- Synthèse de KPI ou de résultats d'un projet.

## Entrées

- Période et périmètre.
- KPI de référence (voir [`../06-dashboard/command-center.md`](../06-dashboard/command-center.md)).
- Données sources (via [`../08-integrations/`](../08-integrations/)).

## Étapes

1. **Cadrer** : période, audience, question à laquelle le rapport répond.
2. **Collecter** : récupérer les chiffres, les dater et les sourcer.
3. **Comparer** : vs période précédente, vs objectif.
4. **Extraire les insights** : 3 à 5 enseignements, pas une avalanche de chiffres.
5. **Alerter** : signaler explicitement ce qui dérape.
6. **Recommander** : terminer par les actions à prendre.

## Format de sortie

```markdown
# Rapport <type> — <période>
*Pour : <audience> · Source : <intégrations> · Généré : AAAA-MM-JJ*

## En une phrase
<le message clé>

## KPI
| Indicateur | Valeur | vs N-1 | vs objectif |
|---|---|---|---|

## Insights
1. …

## Alertes
- 🔴 …

## Actions recommandées
- [ ] …
```

## Checklist qualité

- [ ] Chaque chiffre est daté et sourcé.
- [ ] Le rapport tient en une page lisible.
- [ ] Les insights priment sur les données brutes.
- [ ] Écrit dans [`../07-outputs/reports/`](../07-outputs/reports/).
