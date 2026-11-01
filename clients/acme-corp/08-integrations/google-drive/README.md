---
type: integration
updated: 2026-11-01
tags: [integration, drive, storage]
status: à configurer
---

# Intégration — Google Drive

> Accès aux documents de Example Demo Company stockés sur Drive.

## Objectif
Ingérer des documents sources et déposer des livrables générés.

## Authentification
- Méthode : OAuth 2.0 (Google).
- Accès minimal : dossiers explicitement partagés avec l'AI OS.

## Capacités
| Action | Type | Validation |
|---|---|---|
| Lister / lire fichiers d'un dossier autorisé | lecture | auto |
| Importer un document → [`sources/`](../../01-company-brain/sources/) | lecture | auto |
| Déposer un livrable depuis [`07-outputs/`](../../07-outputs/) | écriture | requise |

## Utilisé par
- Tous les agents (ingestion de sources, dépôt de livrables).

## Garde-fous
- Périmètre restreint aux dossiers partagés.
- Pas de suppression de fichiers.
- Un document importé devient une **source immuable**.
