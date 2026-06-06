---
type: integration
updated: {{INSTANCIATION_DATE}}
tags: [integration, n8n, automation, orchestration]
status: à configurer
---

# Intégration — n8n

> Le moteur d'orchestration qui exécute les workflows de l'AI OS en arrière-plan.

## Objectif
Déclencher et enchaîner les actions automatisées (planifiées ou événementielles) entre l'AI OS et les autres outils.

## Authentification
- Méthode : instance n8n (self-hosted ou cloud) + credentials par service.
- Webhooks signés ; secrets hors dépôt.

## Rôle
n8n est la **couche d'exécution** des [`workflows`](../../05-workflows/) :

| Workflow AI OS | Déclencheur n8n |
|---|---|
| [`weekly-reporting`](../../05-workflows/weekly-reporting.md) | Cron (lundi 08:00) |
| [`internal-brief`](../../05-workflows/internal-brief.md) | Cron (chaque matin) |
| [`sales-follow-up`](../../05-workflows/sales-follow-up.md) | Webhook (nouveau lead) |
| [`client-onboarding`](../../05-workflows/client-onboarding.md) | Webhook (formulaire signé) |

## Capacités
| Action | Type | Validation |
|---|---|---|
| Déclencher un workflow | orchestration | selon le workflow |
| Router les données entre outils | lecture/écriture | héritée du connecteur |
| Appeler l'AI OS (agent) | orchestration | auto |

## Garde-fous
- n8n orchestre mais **n'outrepasse pas** les règles d'écriture : une étape sortante reste soumise à validation.
- Chaque exécution est journalisée et visible dans [`workflow-view`](../../06-dashboard/workflow-view.md).
- Les credentials suivent le moindre privilège.
