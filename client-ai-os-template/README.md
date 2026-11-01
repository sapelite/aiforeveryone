# Client AI OS — Template

> Le **système d'exploitation IA** livré à chaque client B2B.
> Un cerveau d'entreprise structuré, opéré par un agent LLM, qui automatise le travail interne et améliore la prise de décision.

Ce dépôt est un **template**. On le clone par client, on remplace les variables `{{...}}` par les réponses du formulaire d'onboarding, et on obtient un AI OS sur mesure, prêt à l'emploi.

---

## Comment ça fonctionne

```
Formulaire onboarding  →  Remplissage des {{variables}}  →  AI OS instancié
       (le site)              (notre équipe + IA)              (ce dossier)
```

L'agent LLM (Claude) lit ce dossier comme son système d'exploitation :

1. Il démarre par [`00-system/index.md`](00-system/index.md) — son point d'entrée.
2. Il applique les règles de [`00-system/operating-rules.md`](00-system/operating-rules.md).
3. Il puise sa connaissance dans [`01-company-brain/`](01-company-brain/) et [`02-knowledge-graph/`](02-knowledge-graph/) — sa mémoire business.
4. Il incarne un **agent** ([`03-agents/`](03-agents/)) selon la tâche.
5. Il exécute des **skills** ([`04-skills/`](04-skills/)) et des **workflows** ([`05-workflows/`](05-workflows/)).
6. Il restitue dans le **dashboard** ([`06-dashboard/`](06-dashboard/)) et écrit les livrables dans [`07-outputs/`](07-outputs/).
7. Il se connecte aux outils du client via [`08-integrations/`](08-integrations/).

---

## Structure

| Dossier | Rôle |
|---|---|
| `00-system/` | Les règles d'exploitation : comment l'IA se comporte, navigue, nomme. |
| `01-company-brain/` | La connaissance structurée de l'entreprise (identité, offres, clients, équipe, process…). |
| `02-knowledge-graph/` | Entités, relations et index — la mémoire interrogeable. |
| `03-agents/` | Les agents spécialisés (stratège, opérations, ventes, reporting, support). |
| `04-skills/` | Les compétences réutilisables (analyser un process, créer un rapport…). |
| `05-workflows/` | Les enchaînements multi-étapes (onboarding, reporting hebdo…). |
| `06-dashboard/` | Les vues de pilotage rendues par l'IA. |
| `07-outputs/` | Les livrables générés (rapports, propositions, audits…). |
| `08-integrations/` | Les connecteurs vers les outils du client (CRM, Slack, Drive…). |

---

## Variables d'instanciation

Ces variables proviennent directement du **formulaire d'onboarding**. Remplacer chaque occurrence lors de l'instanciation d'un client.

| Variable | Champ du formulaire | Exemple |
|---|---|---|
| `{{COMPANY_NAME}}` | Nom de l'entreprise | Example Demo Company |
| `{{WEBSITE}}` | Site web | https://example.invalid |
| `{{INDUSTRY}}` | Secteur d'activité | SaaS / Tech |
| `{{EMPLOYEE_COUNT}}` | Nombre d'employés | 51-200 |
| `{{TEAM_SIZE}}` | Utilisateurs du système | 16-50 |
| `{{PRIMARY_CONTACT}}` | Contact principal | Alex Example |
| `{{CONTACT_ROLE}}` | Rôle du contact | Head of Ops |
| `{{CONTACT_EMAIL}}` | Email professionnel | alex@example.invalid |
| `{{CONTACT_PHONE}}` | Téléphone | 000-000-0000 |
| `{{PROCESSES}}` | Processus métier décrits | (texte libre) |
| `{{PAIN_POINTS}}` | Points de douleur | (texte libre) |
| `{{AUTOMATION_AREAS}}` | Domaines à automatiser | Qualification de leads, Reporting |
| `{{TOOLS}}` | Outils utilisés | Slack, HubSpot, Notion |
| `{{GOALS}}` | Objectifs | (texte libre) |
| `{{TIMELINE}}` | Délai souhaité | 1-3 mois |
| `{{BUDGET}}` | Budget mensuel | Example budget (not real data) |

### Tokens dérivés (générés à l'instanciation, pas dans le formulaire)

| Variable | Comment la calculer | Exemple |
|---|---|---|
| `{{INSTANCIATION_DATE}}` | Date du jour à la création | 2026-06-05 |
| `{{COMPANY_ID}}` | `kebab-case` de `{{COMPANY_NAME}}` | example-demo-company |
| `{{PRIMARY_CONTACT_ID}}` | `kebab-case` de `{{PRIMARY_CONTACT}}` | alex-example |

> Astuce : un script d'instanciation peut faire un simple *find & replace* de ces tokens à partir du JSON du formulaire, puis dériver les `*_ID` et la date.

---

## Conventions

- **Fichiers** : `kebab-case.md` pour les fichiers de système ; `Titre En Clair.md` pour les livrables.
- **Liens internes** : chemins relatifs markdown `[texte](chemin.md)`.
- **Dates** : format `AAAA-MM-JJ` (ISO 8601).
- **Frontmatter** : chaque fiche de connaissance porte un en-tête YAML (`type`, `updated`, `tags`).

Voir [`00-system/naming-conventions.md`](00-system/naming-conventions.md) pour le détail.

---

*Template maintenu par l'équipe AI OS. Version 1.0.*
