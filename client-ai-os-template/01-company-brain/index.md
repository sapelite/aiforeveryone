---
type: index
updated: {{INSTANCIATION_DATE}}
tags: [company-brain, index]
---

# 🧠 Company Brain — {{COMPANY_NAME}}

La connaissance structurée de l'entreprise. **Source de vérité** de l'AI OS.

| Section | Contenu | Dossier |
|---|---|---|
| Identité | Mission, vision, valeurs, histoire | [`identity/`](identity/) |
| Offres | Produits, services, prix, packaging | [`offers/`](offers/) |
| Clients | Comptes, segments, historique | [`customers/`](customers/) |
| Positionnement | Marché, concurrence, différenciateurs | [`positioning/`](positioning/) |
| Équipe | Membres, rôles, responsabilités | [`team/`](team/) |
| Outils | Stack technique et métier | [`tools/`](tools/) |
| Processus | Procédures internes (SOP) | [`processes/`](processes/) |
| Décisions | Journal des décisions actées | [`decisions/`](decisions/) |
| Documents | Documents de travail générés | [`documents/`](documents/) |
| Sources | Documents bruts immuables | [`sources/`](sources/) |

## Règles

1. Toute affirmation factuelle de l'AI OS s'appuie sur une fiche d'ici.
2. Une fiche par entité ; frontmatter obligatoire (voir [`../00-system/naming-conventions.md`](../00-system/naming-conventions.md)).
3. Les fiches `_template-*.md` sont des modèles à dupliquer, pas des données.
4. `sources/` est **immuable** : on n'y modifie jamais un document brut.

## Profil rapide

- **Entreprise** : {{COMPANY_NAME}} · {{WEBSITE}}
- **Secteur** : {{INDUSTRY}} · **Taille** : {{EMPLOYEE_COUNT}}
- **Contact** : {{PRIMARY_CONTACT}} ({{CONTACT_ROLE}}) · {{CONTACT_EMAIL}}
- **Objectifs** : {{GOALS}}
