---
type: entity
entity-type: person | customer | partner | product | tool | project | team | concept
entity-id: <kebab-case-id-stable>
updated: {{INSTANCIATION_DATE}}
tags: [entity]
status: active
---

# <Libellé de l'entité>

> Fiche d'entité du knowledge-graph. L'**`entity-id` ne change jamais**, même si le libellé évolue.

## Identité
- **ID** : `<kebab-case-id>`
- **Type** : <person | customer | tool | …>
- **Libellé** : …

## Description
1-2 phrases factuelles.

## Attributs
| Clé | Valeur |
|---|---|

## Relations
- `<cette-entité>  --[manages]-->  <autre-id>`
- `<cette-entité>  --[uses]-->  <autre-id>`

## Fiche détaillée
Lien vers le company-brain : [`../../01-company-brain/...`](../../01-company-brain/)

## Sources
- [`../../01-company-brain/sources/...`](../../01-company-brain/sources/)
