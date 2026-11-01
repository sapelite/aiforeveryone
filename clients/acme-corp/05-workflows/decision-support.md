---
type: workflow
updated: 2026-11-01
tags: [workflow, strategy, decision]
trigger: Décision à prendre
agents: [strategist-agent]
---

# Workflow — Aide à la décision

Structurer une décision importante pour Example Demo Company et la consigner.

## Déclencheur

Une décision non triviale doit être prise (produit, marché, recrutement, investissement, arbitrage de priorités).

## Étapes

1. **Cadrer la décision** *(Stratège)* — quelle question exactement ? Quel critère de décision ? Quelle échéance ?
2. **Contexte** *(Stratège)* — charger les fiches pertinentes ([`positioning/`](../01-company-brain/positioning/), [`decisions/`](../01-company-brain/decisions/), [`offers/`](../01-company-brain/offers/)).
3. **Options** *(Stratège)* — lister 2-4 options avec, pour chacune : bénéfices, coûts, risques, réversibilité.
4. **Comparaison** *(Stratège)* — matrice impact / effort / risque ; cohérence avec décisions passées.
5. **Recommandation** *(Stratège)* — une option recommandée, hypothèses explicites, incertitude assumée.
6. **Consignation** *(Stratège)* — écrire la note de décision dans [`../01-company-brain/decisions/`](../01-company-brain/decisions/).

## Format de sortie

```markdown
# Décision — <sujet> (AAAA-MM-JJ)
**Question** · **Critère** · **Échéance** · **Décideur**

## Options
| Option | Bénéfices | Coûts | Risques | Réversible ? |

## Recommandation & rationale
## Hypothèses clés
## Suivi : revoir le <date>
```

## Critère de fin

Décision documentée, traçable, avec critère de succès et date de revue.
