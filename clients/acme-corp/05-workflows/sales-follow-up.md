---
type: workflow
updated: 2026-11-01
tags: [workflow, sales]
trigger: Lead entrant / relance planifiée
agents: [sales-agent]
---

# Workflow — Suivi commercial

Qualifier, proposer, relancer — sans rien perdre du pipeline.

## Déclencheur

Nouveau lead entrant, ou échéance de relance atteinte sur un compte.

## Étapes

1. **Qualification** *(Ventes)* — scorer le lead (taille, secteur, besoin, budget) selon les critères de Example Demo Company.
2. **Enrichissement** *(Ventes)* — créer/mettre à jour la fiche dans [`../01-company-brain/customers/`](../01-company-brain/customers/) et le CRM ([`../08-integrations/crm/`](../08-integrations/crm/)).
3. **Proposition** *(Ventes)* — si qualifié : [`../04-skills/generate-proposal.md`](../04-skills/generate-proposal.md).
4. **Séquence de relance** *(Ventes)* — définir 3 relances (J+2, J+7, J+14) avec angles différents.
5. **Préparation des messages** *(Ventes)* — rédiger chaque relance (envoi après validation via [`email/`](../08-integrations/email/)).
6. **Mise à jour pipeline** *(Ventes + Reporting)* — refléter l'avancement dans le CRM et [`../06-dashboard/`](../06-dashboard/).

## Sorties

- Fiche compte à jour, proposition (`07-outputs/proposals/`), séquence de relance.

## Critère de fin

Lead qualifié ou disqualifié, prochaine action datée dans le CRM.
