---
type: skill
updated: 2026-06-05
tags: [skill, sales]
used-by: [sales-agent]
---

# Skill — Générer une proposition commerciale

Produire une proposition personnalisée, alignée sur l'offre et le positionnement de Acme Corp.

## Quand l'utiliser

- Un lead qualifié attend une proposition.
- Renouvellement ou extension d'un compte existant.

## Entrées

- Besoin et contexte du prospect (compte dans [`../01-company-brain/customers/`](../01-company-brain/customers/)).
- Offres applicables ([`../01-company-brain/offers/`](../01-company-brain/offers/)).
- Différenciateurs ([`../01-company-brain/positioning/`](../01-company-brain/positioning/)).

## Étapes

1. **Rappeler le besoin** du prospect dans ses mots.
2. **Relier** le besoin à l'offre la plus pertinente.
3. **Construire la solution** : périmètre, livrables, planning.
4. **Chiffrer** : prix issu du catalogue d'offres, conditions claires.
5. **Différencier** : pourquoi Acme Corp plutôt qu'un autre.
6. **Appeler à l'action** : prochaine étape et validité de l'offre.

## Format de sortie

```markdown
# Proposition — <prospect> (AAAA-MM-JJ)

## Votre contexte
## Notre compréhension du besoin
## Solution proposée
| Livrable | Détail | Délai |
## Investissement
## Pourquoi Acme Corp
## Prochaine étape · Validité : <date>
```

## Checklist qualité

- [ ] Prix conformes au catalogue d'offres.
- [ ] Aucune promesse hors périmètre des offres.
- [ ] Ton de marque respecté.
- [ ] Enregistrée dans [`../07-outputs/proposals/`](../07-outputs/proposals/).
