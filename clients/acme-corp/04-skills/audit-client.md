---
type: skill
updated: 2026-11-01
tags: [skill, strategy, operations]
used-by: [strategist-agent, operations-agent]
---

# Skill — Auditer (un client / l'entreprise)

Réaliser un état des lieux structuré : situation actuelle, écarts vs objectifs, opportunités prioritaires.

## Quand l'utiliser

- Onboarding d'un nouveau client (audit initial).
- Revue périodique de Example Demo Company elle-même.
- Avant un plan d'action ou une décision majeure.

## Entrées

- Données de l'entité auditée (formulaire d'onboarding, company-brain).
- Objectifs : Réduire de 50% le temps de qualification des leads, centraliser la connaissance de l'équipe, et accélérer le reporting hebdomadaire..
- Points de douleur : Trop de temps perdu en saisie manuelle, données éparpillées entre HubSpot, Slack et Drive, reporting lent et peu fiable, décisions ralenties par le manque de visibilité..

## Étapes

1. **Périmètre** : que couvre l'audit (process, outils, équipe, ventes…).
2. **État des lieux** : décrire la situation actuelle, factuellement.
3. **Écarts** : comparer à l'objectif / aux bonnes pratiques.
4. **Opportunités** : lister les gains possibles, classés par impact/effort.
5. **Risques** : ce qui menace les objectifs.
6. **Recommandations** : top 3 priorités → renvoi vers [`create-action-plan.md`](create-action-plan.md).

## Format de sortie

```markdown
# Audit — <entité> (AAAA-MM-JJ)

## Périmètre & méthode
## Situation actuelle
## Écarts vs objectifs
## Opportunités (matrice impact / effort)
## Risques
## Top 3 recommandations
```

## Checklist qualité

- [ ] Constat séparé de la recommandation.
- [ ] Opportunités priorisées (impact vs effort).
- [ ] Aligné sur Réduire de 50% le temps de qualification des leads, centraliser la connaissance de l'équipe, et accélérer le reporting hebdomadaire..
- [ ] Enregistré dans [`../07-outputs/audits/`](../07-outputs/audits/).
