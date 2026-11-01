---
type: relationships
updated: 2026-11-01
tags: [knowledge-graph, relationships]
---

# Relations — Example Demo Company

Le registre des liens entre entités. Format : `source --[relation]--> cible` (identifiants stables).

## Relations autorisées
`manages` · `reports-to` · `owns` · `uses` · `partners-with` · `serves` · `depends-on` · `member-of`
(voir [`../metadata/schema.md`](../metadata/schema.md))

## Registre

```
# Organisation
alex-example  --[member-of]-->   example-demo-company
# exemple : marie-dupont  --[manages]-->  equipe-ops

# Outils
# exemple : example-demo-company  --[uses]-->  hubspot

# Clients
# exemple : example-demo-company  --[serves]-->  acme-corp
```

> Ajouter une ligne à chaque nouvelle relation établie. Les agents lisent ce fichier pour « comprendre qui fait quoi ».

## Requêtes fréquentes
- *Qui gère X ?* → chercher `--[manages]--> X`
- *Quels outils pour le process Y ?* → entités liées au process via `uses` / `depends-on`
- *Quel contact chez le client Z ?* → `Z --[member-of]--> ...` inverse
