---
type: integration
updated: 2026-11-01
tags: [integration, slack, comms]
status: à configurer
---

# Intégration — Slack

> Canal de communication entre l'AI OS et l'équipe de Example Demo Company.

## Objectif
Diffuser briefs, rapports et alertes ; recevoir des demandes.

## Authentification
- Méthode : Slack App + OAuth (bot token).
- Accès minimal : canaux explicitement ajoutés.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lire les messages d'un canal autorisé | lecture | auto |
| Publier un brief / rapport | écriture | requise |
| Envoyer une alerte automatique | écriture | configurable* |

\* Les alertes critiques peuvent être pré-autorisées par canal.

## Utilisé par
- [`internal-brief`](../../05-workflows/internal-brief.md), [`weekly-reporting`](../../05-workflows/weekly-reporting.md)
- Agent **Reporting** (alertes dashboard).

## Garde-fous
- Pas de message en DM sans demande explicite.
- Ton conforme à [`../../01-company-brain/positioning/`](../../01-company-brain/positioning/).
