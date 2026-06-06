---
type: skill
updated: 2026-06-05
tags: [skill, productivity]
used-by: [support-agent, operations-agent, sales-agent]
---

# Skill — Synthétiser une réunion

Transformer une réunion, un appel ou un fil d'échanges en compte-rendu actionnable.

## Quand l'utiliser

- Après une réunion interne ou client.
- Pour transformer des notes brutes en décisions + actions.

## Entrées

- Notes, transcription ou enregistrement.
- Participants et contexte (projet, compte client).

## Étapes

1. **Identifier** : date, participants, objet.
2. **Extraire les décisions** prises (qui a décidé quoi).
3. **Lister les actions** : tâche → responsable → échéance.
4. **Noter les points ouverts** et désaccords non tranchés.
5. **Relier** aux entités connues ([`../02-knowledge-graph/`](../02-knowledge-graph/)) et au compte/projet.
6. **Capitaliser** : toute décision actée → [`../01-company-brain/decisions/`](../01-company-brain/decisions/).

## Format de sortie

```markdown
# CR — <objet> (AAAA-MM-JJ)
*Participants : … · Contexte : …*

## Décisions
- …

## Actions
| Action | Responsable | Échéance |
|---|---|---|

## Points ouverts
- …

## Prochaine réunion : …
```

## Checklist qualité

- [ ] Chaque action a un responsable et une échéance.
- [ ] Les décisions sont distinguées des simples discussions.
- [ ] Les décisions structurantes sont consignées dans `decisions/`.
