---
type: skill
updated: 2026-06-05
tags: [skill, operations, strategy]
used-by: [strategist-agent, operations-agent]
---

# Skill — Créer un plan d'action

Transformer un constat (audit, analyse, décision) en plan exécutable, séquencé et assignable.

## Quand l'utiliser

- À la suite d'un audit ou d'une analyse de processus.
- Pour opérationnaliser une décision stratégique.

## Entrées

- Constat / objectif à atteindre.
- Ressources disponibles (équipe 16-50, outils Slack, HubSpot, Google Workspace, Notion).
- Contrainte de délai (1-3 mois).

## Étapes

1. **Objectif** : formuler le résultat attendu et son critère de succès.
2. **Jalons** : découper en 2-4 jalons datés.
3. **Tâches** : pour chaque jalon → tâches concrètes, responsable, échéance.
4. **Dépendances** : signaler les bloquants et l'ordre nécessaire.
5. **Mesure** : définir comment on saura que c'est réussi.
6. **Risques & mitigations**.

## Format de sortie

```markdown
# Plan d'action — <objectif> (AAAA-MM-JJ)

**Résultat attendu** · **Critère de succès** · **Horizon : 1-3 mois**

## Jalons
### Jalon 1 — <nom> (échéance)
| Tâche | Responsable | Échéance | Statut |
|---|---|---|---|

## Dépendances & risques
## Mesure du succès
```

## Checklist qualité

- [ ] Chaque tâche est assignée et datée.
- [ ] Le critère de succès est mesurable.
- [ ] Le plan tient dans l'horizon 1-3 mois.
- [ ] Enregistré dans [`../07-outputs/action-plans/`](../07-outputs/action-plans/).
