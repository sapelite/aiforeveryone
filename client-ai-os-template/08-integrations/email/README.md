---
type: integration
updated: {{INSTANCIATION_DATE}}
tags: [integration, email]
status: à configurer
---

# Intégration — Email

> Envoi et réception d'emails pour {{COMPANY_NAME}}.

## Objectif
Préparer et (après validation) envoyer relances, propositions et réponses ; trier l'entrant.

## Authentification
- Méthode : OAuth (Gmail/Microsoft 365) ou SMTP/IMAP dédié.
- Accès minimal : boîte ou alias dédié à l'AI OS de préférence.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lire/trier l'entrant | lecture | auto |
| Rédiger un brouillon | écriture | auto |
| **Envoyer** un email | écriture | **toujours requise** |

## Utilisé par
- Agent **Ventes** · [`sales-follow-up`](../../05-workflows/sales-follow-up.md)
- Agent **Support** (réponses préparées).

## Garde-fous
- **Aucun envoi sans validation explicite** (règle 6 des [operating-rules](../../00-system/operating-rules.md)).
- Signature et ton de marque respectés.
- Données destinataires confidentielles.
