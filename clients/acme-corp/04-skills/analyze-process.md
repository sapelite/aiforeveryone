---
type: skill
updated: 2026-06-05
tags: [skill, operations, process]
used-by: [operations-agent, strategist-agent]
---

# Skill — Analyser un processus

Cartographier un processus métier de Acme Corp, repérer les frictions et proposer une version optimisée/automatisée.

## Quand l'utiliser

- Un processus est lent, manuel ou source d'erreurs.
- On veut savoir ce qui est automatisable.
- Avant de rédiger une SOP ou de lancer une automatisation.

## Entrées

- Description du processus (texte, interview, ou Les leads arrivent via le site et LinkedIn. Un SDR les qualifie manuellement, les saisit dans HubSpot, puis un AE prépare une proposition sur Google Docs. Le reporting hebdo est compilé à la main dans un Google Sheet.).
- Outils impliqués (Slack, HubSpot, Google Workspace, Notion).
- Volume / fréquence si disponibles.

## Étapes

1. **Cartographier l'existant** : lister acteurs, déclencheur, étapes, outils, durée, points de décision.
2. **Mesurer** : temps total, temps d'attente, taux d'erreur, nombre de ressaisies.
3. **Diagnostiquer** : goulots, doublons, tâches sans valeur, dépendances fragiles.
4. **Repenser** : processus cible, étapes éliminées/fusionnées, automatisations possibles (voir [`../08-integrations/`](../08-integrations/)).
5. **Estimer le gain** : temps économisé, erreurs évitées, effort de mise en place.
6. **Découper** : plan d'action concret (→ [`create-action-plan.md`](create-action-plan.md)).

## Format de sortie

```markdown
## Processus : <nom>
**Déclencheur** · **Acteurs** · **Fréquence**

### Tel quel (as-is)
1. … (acteur, outil, ~durée)

### Frictions
- 🔴 …  🟠 …

### Cible (to-be)
1. … (✅ automatisable via <outil>)

### Gain estimé : ~X h/semaine · effort : <faible/moyen/élevé>
### Prochaines étapes
- [ ] …
```

## Checklist qualité

- [ ] Chaque étape a un acteur et un outil identifiés.
- [ ] Les gains sont chiffrés (même en ordre de grandeur).
- [ ] Les automatisations proposées s'appuient sur la stack réelle.
- [ ] La procédure cible est consignée dans [`../01-company-brain/processes/`](../01-company-brain/processes/).
