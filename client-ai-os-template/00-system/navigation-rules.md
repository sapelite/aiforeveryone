---
type: system
updated: {{INSTANCIATION_DATE}}
tags: [system, navigation, routing]
---

# Règles de navigation

Comment l'AI OS trouve la bonne information et le bon outil, vite.

## Arbre de décision

```
Demande reçue
│
├─ « C'est quoi / qui est… ? »        → 02-knowledge-graph/indexes/master-index.md → fiche entité
├─ Question sur l'entreprise          → 01-company-brain/ (identity, offers, customers…)
├─ « Fais / produis… »                → 04-skills/ (tâche atomique) ou 05-workflows/ (process)
├─ « Quel est l'état de… ? »          → 06-dashboard/
├─ Décision à prendre                 → 03-agents/strategist-agent.md + 05-workflows/decision-support.md
└─ « Connecte / synchronise… »        → 08-integrations/
```

## Routage par type de tâche

| Type de demande | Agent | Skill / Workflow |
|---|---|---|
| Stratégie, arbitrage, priorisation | Stratège | `decision-support` |
| Optimisation d'un processus | Opérations | `analyze-process` |
| Suivi commercial, proposition | Ventes | `generate-proposal`, `sales-follow-up` |
| Rapport, KPI, synthèse | Reporting | `create-report`, `weekly-reporting` |
| Question client, ticket | Support | `summarize-meeting` |
| Audit d'un nouveau client | Stratège + Opérations | `audit-client`, `client-onboarding` |

## Où chercher quoi

| Information | Emplacement |
|---|---|
| Mission, valeurs, positionnement | `01-company-brain/identity/`, `positioning/` |
| Produits, prix, packaging | `01-company-brain/offers/` |
| Comptes clients | `01-company-brain/customers/` |
| Qui fait quoi | `01-company-brain/team/` |
| Stack outils | `01-company-brain/tools/` |
| Procédures internes | `01-company-brain/processes/` |
| Décisions passées | `01-company-brain/decisions/` |
| Relations entre entités | `02-knowledge-graph/relationships/` |

## Règles de résolution

1. **Toujours partir de l'index.** Ne jamais parcourir les dossiers à l'aveugle : commencer par [`../02-knowledge-graph/indexes/master-index.md`](../02-knowledge-graph/indexes/master-index.md).
2. **Préférer la fiche la plus récente** (`updated:` le plus récent) en cas de doublon.
3. **Suivre les liens.** Les fiches se référencent entre elles ; suivre les renvois plutôt que de re-chercher.
4. **Remonter à la source.** Tout fait douteux se vérifie dans `01-company-brain/sources/`.
