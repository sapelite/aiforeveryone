---
type: schema
updated: 2026-11-01
tags: [knowledge-graph, schema, metadata]
---

# Schéma du Knowledge Graph

Définit ce qui est autorisé dans le graphe. **Toute entité/relation doit respecter ce schéma.**

## Types d'entités

| Type | Description | Dossier company-brain |
|---|---|---|
| `person` | Membre de l'équipe | `team/` |
| `customer` | Compte client / prospect | `customers/` |
| `partner` | Partenaire, fournisseur | `customers/` ou `identity/` |
| `product` | Offre / produit | `offers/` |
| `tool` | Outil de la stack | `tools/` |
| `project` | Projet / chantier | `processes/` ou `documents/` |
| `team` | Équipe / pôle | `team/` |
| `concept` | Idée, méthode, sujet | `documents/` |

## Types de relations

| Relation | Sens | Exemple |
|---|---|---|
| `manages` | A dirige B | personne → équipe |
| `reports-to` | A rend compte à B | personne → personne |
| `owns` | A est responsable de B | personne → projet |
| `uses` | A utilise B | entreprise → outil |
| `partners-with` | A est partenaire de B | entreprise → partenaire |
| `serves` | A sert B | entreprise → client |
| `depends-on` | A dépend de B | process → outil |
| `member-of` | A appartient à B | personne → équipe/entreprise |

## Frontmatter d'entité (obligatoire)

```yaml
type: entity
entity-type: <un des types ci-dessus>
entity-id: <kebab-case-stable>
updated: AAAA-MM-JJ
status: active | draft | archived
```

## Règles d'intégrité
1. `entity-id` unique et **immuable**.
2. Une relation ne référence que des `entity-id` existants.
3. Tout nouveau type doit être ajouté **ici d'abord** (et fait l'objet d'une décision).
