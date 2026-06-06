---
type: integration
updated: {{INSTANCIATION_DATE}}
tags: [integration, crm]
status: à configurer
---

# Intégration — CRM

> Connecteur vers le CRM de {{COMPANY_NAME}} (ex. HubSpot, Salesforce, Pipedrive — selon {{TOOLS}}).

## Objectif
Synchroniser comptes, contacts et pipeline avec le knowledge-graph et la vue clients.

## Authentification
- Méthode : OAuth 2.0 / clé API (selon l'outil).
- Secrets : stockés hors dépôt (variables d'environnement / coffre).
- Accès minimal : lecture comptes/deals ; écriture sur notes & étapes uniquement.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lire comptes & deals | lecture | auto |
| Lire pipeline | lecture | auto |
| Créer/mettre à jour une note | écriture | requise |
| Changer l'étape d'un deal | écriture | requise |

## Utilisé par
- Agent **Ventes** · workflow [`sales-follow-up`](../../05-workflows/sales-follow-up.md)
- Agent **Reporting** · [`weekly-reporting`](../../05-workflows/weekly-reporting.md)

## Mappage
- Compte CRM ↔ entité `customer` ([`../../02-knowledge-graph/`](../../02-knowledge-graph/))
- Deal ↔ ligne de [`client-view`](../../06-dashboard/client-view.md)

## Garde-fous
- Jamais de suppression dans le CRM.
- Toute écriture validée et journalisée.
