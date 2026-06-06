---
type: integration
updated: 2026-06-05
tags: [integration, notion, knowledge]
status: à configurer
---

# Intégration — Notion

> Pont entre la base Notion de Acme Corp et le company-brain.

## Objectif
Importer la connaissance existante de Notion et y publier des synthèses.

## Authentification
- Méthode : Notion Internal Integration (token).
- Accès minimal : bases/pages partagées avec l'intégration.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lire pages & bases partagées | lecture | auto |
| Importer → [`company-brain`](../../01-company-brain/) | lecture | auto |
| Créer/mettre à jour une page | écriture | requise |

## Utilisé par
- Agent **Support** (FAQ/procédures), agent **Opérations** (process).

## Garde-fous
- Notion peut être miroir, pas source de vérité : la vérité reste dans le company-brain.
- Pas de suppression de pages.
