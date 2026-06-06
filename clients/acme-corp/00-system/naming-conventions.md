---
type: system
updated: 2026-06-05
tags: [system, conventions, schema]
---

# Conventions de nommage & de structure

Pour que l'AI OS reste navigable et cohérent dans le temps.

## Fichiers

| Type | Convention | Exemple |
|---|---|---|
| Fichier système | `kebab-case.md` | `operating-rules.md` |
| Fiche de connaissance | `kebab-case.md` | `acme-corp.md` |
| Livrable (output) | `Titre En Clair.md` | `Rapport Hebdo 2026-06-05.md` |
| Index de section | `index.md` ou `_index.md` | `index.md` |

Caractères interdits dans les noms : `: " / \ < > | ? *`.

## Frontmatter (en-tête YAML)

Chaque fiche de connaissance commence par :

```yaml
---
type: entity | concept | process | decision | offer | customer | source | system
updated: AAAA-MM-JJ
tags: [tag1, tag2]
status: active | draft | archived   # optionnel
owner: Marie Dupont          # optionnel
---
```

## Entités du knowledge-graph

- **Identifiant** : `kebab-case` unique et stable (ne change jamais, même si le libellé change).
- **Types d'entités** : `person`, `customer`, `partner`, `product`, `tool`, `project`, `team`, `concept`.
- **Fichier** : `02-knowledge-graph/entities/<type>/<id>.md`.

## Relations

Format des liens dans `02-knowledge-graph/relationships/` :

```
<entité-a>  --[relation]-->  <entité-b>
marie-dupont  --[manages]-->  equipe-ops
acme-corp     --[uses]-->     hubspot
```

Relations standard : `manages`, `reports-to`, `owns`, `uses`, `partners-with`, `serves`, `depends-on`.

## Dates & nombres

- Dates : `AAAA-MM-JJ` (ISO 8601). Jamais de date relative dans une fiche.
- Montants : devise explicite (`12 000 EUR`).
- Pourcentages et KPI : préciser la période (`+18 % vs T1 2026`).

## Liens

- **Dans une fiche** : chemin relatif markdown — `[Acme Corp](../customers/acme-corp.md)`.
- **Référence d'entité** : par identifiant stable, jamais par libellé.

## Statuts

| Statut | Sens |
|---|---|
| `active` | À jour, fait foi. |
| `draft` | En cours, ne fait pas foi. |
| `archived` | Conservé pour historique, ne plus utiliser comme source. |
