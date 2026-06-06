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
| `Acme Corp` | Nom de l'entreprise | Acme Corp |
| `https://acme.com` | Site web | https://acme.com |
| `SaaS / Tech` | Secteur d'activité | SaaS / Tech |
| `51-200` | Nombre d'employés | 51-200 |
| `16-50` | Utilisateurs du système | 16-50 |
| `Marie Dupont` | Contact principal | Marie Dupont |
| `Head of Operations` | Rôle du contact | Head of Ops |
| `marie@acme.com` | Email professionnel | marie@acme.com |
| `+33 6 12 34 56 78` | Téléphone | +33 6 12 34 56 78 |
| `Les leads arrivent via le site et LinkedIn. Un SDR les qualifie manuellement, les saisit dans HubSpot, puis un AE prépare une proposition sur Google Docs. Le reporting hebdo est compilé à la main dans un Google Sheet.` | Processus métier décrits | (texte libre) |
| `Trop de temps perdu en saisie manuelle, données éparpillées entre HubSpot, Slack et Drive, reporting lent et peu fiable, décisions ralenties par le manque de visibilité.` | Points de douleur | (texte libre) |
| `Qualification de leads, Reporting / Analytics, Onboarding clients` | Domaines à automatiser | Qualification de leads, Reporting |
| `Slack, HubSpot, Google Workspace, Notion` | Outils utilisés | Slack, HubSpot, Notion |
| `Réduire de 50% le temps de qualification des leads, centraliser la connaissance de l'équipe, et accélérer le reporting hebdomadaire.` | Objectifs | (texte libre) |
| `1-3 mois` | Délai souhaité | 1-3 mois |
| `5-10 000 EUR` | Budget mensuel | 5-10 000 EUR |

### Tokens dérivés (générés à l'instanciation, pas dans le formulaire)

| Variable | Comment la calculer | Exemple |
|---|---|---|
| `2026-06-05` | Date du jour à la création | 2026-06-05 |
| `acme-corp` | `kebab-case` de `Acme Corp` | acme-corp |
| `marie-dupont` | `kebab-case` de `Marie Dupont` | marie-dupont |

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
