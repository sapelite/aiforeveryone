---
type: relationships
updated: {{INSTANCIATION_DATE}}
tags: [knowledge-graph, relationships]
---

# Relations — {{COMPANY_NAME}}

Le registre des liens entre entités. Format : `source --[relation]--> cible` (identifiants stables).

## Relations autorisées
`manages` · `reports-to` · `owns` · `uses` · `partners-with` · `serves` · `depends-on` · `member-of`
(voir [`../metadata/schema.md`](../metadata/schema.md))

## Registre

```
# Organisation
{{PRIMARY_CONTACT_ID}}  --[member-of]-->   {{COMPANY_ID}}
# exemple : marie-dupont  --[manages]-->  equipe-ops

# Outils
# exemple : {{COMPANY_ID}}  --[uses]-->  hubspot

# Clients
# exemple : {{COMPANY_ID}}  --[serves]-->  acme-corp
```

> Ajouter une ligne à chaque nouvelle relation établie. Les agents lisent ce fichier pour « comprendre qui fait quoi ».

## Requêtes fréquentes
- *Qui gère X ?* → chercher `--[manages]--> X`
- *Quels outils pour le process Y ?* → entités liées au process via `uses` / `depends-on`
- *Quel contact chez le client Z ?* → `Z --[member-of]--> ...` inverse
