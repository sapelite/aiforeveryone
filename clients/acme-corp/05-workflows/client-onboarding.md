---
type: workflow
updated: 2026-06-05
tags: [workflow, onboarding]
trigger: Nouveau client signé / formulaire reçu
agents: [strategist-agent, operations-agent]
---

# Workflow — Onboarding client

Du formulaire signé au client opérationnel dans l'AI OS.

## Déclencheur

Un nouveau client de Acme Corp a rempli le formulaire d'onboarding ou vient de signer.

## Étapes

1. **Réception** *(Opérations)* — récupérer les réponses du formulaire (identité, équipe, process, outils, objectifs).
2. **Création de la fiche compte** *(Opérations)* — créer l'entité client dans [`../02-knowledge-graph/entities/`](../02-knowledge-graph/entities/) et la fiche dans [`../01-company-brain/customers/`](../01-company-brain/customers/).
3. **Audit initial** *(Stratège)* — exécuter [`../04-skills/audit-client.md`](../04-skills/audit-client.md) sur la situation du client.
4. **Plan d'action** *(Stratège + Opérations)* — [`../04-skills/create-action-plan.md`](../04-skills/create-action-plan.md) pour les 30/60/90 premiers jours.
5. **Configuration des intégrations** *(Opérations)* — préparer les connecteurs [`../08-integrations/`](../08-integrations/) selon les outils Slack, HubSpot, Google Workspace, Notion.
6. **Brief de lancement** *(Stratège)* — synthèse de kick-off → [`../05-workflows/internal-brief.md`](internal-brief.md).
7. **Mise à jour du dashboard** *(Reporting)* — ajouter le client à [`../06-dashboard/client-view.md`](../06-dashboard/client-view.md).

## Sorties

- Fiche compte active (`customers/`, `entities/`).
- Audit initial (`07-outputs/audits/`).
- Plan d'onboarding 30/60/90 (`07-outputs/action-plans/`).

## Critère de fin

Le client a une fiche complète, un plan d'action validé et apparaît au dashboard.
