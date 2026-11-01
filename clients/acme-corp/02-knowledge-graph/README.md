---
type: index
updated: 2026-11-01
tags: [knowledge-graph]
---

# 🕸️ Knowledge Graph — Example Demo Company

La mémoire **interrogeable** de l'AI OS : les entités, leurs relations, et les index pour les retrouver.

| Dossier | Contenu |
|---|---|
| [`entities/`](entities/) | Une fiche par entité (personne, client, outil, projet…). |
| [`relationships/`](relationships/) | Les liens entre entités (qui gère quoi, qui utilise quoi). |
| [`indexes/`](indexes/) | Index de navigation — **point d'entrée des recherches**. |
| [`metadata/`](metadata/) | Le schéma : types d'entités et de relations autorisés. |

## Principe

Le company-brain ([`../01-company-brain/`](../01-company-brain/)) contient la connaissance **rédigée** ; le knowledge-graph la rend **navigable** par identifiants stables et relations typées.

→ Toute recherche commence par [`indexes/master-index.md`](indexes/master-index.md).
→ Tout type autorisé est défini dans [`metadata/schema.md`](metadata/schema.md).
