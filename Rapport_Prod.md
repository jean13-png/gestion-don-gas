# Rapport final de production

**Date de mise à jour :** 9 septembre 2026  
**Projet :** gestion-don-gas  
**Score de mise en production : 94/100**

## 1. Verdict

Le projet est maintenant apte à une mise en production contrôlée. La migration de rate limiting a été appliquée à la base configurée, et le build de production passe.

Le seuil de 99/100 n’est pas déclaré atteint tant que les tests automatisés, la vérification renforcée du suivi et l’audit final de l’environnement déployé ne sont pas réalisés.

## 2. Correctifs vérifiés et retirés des risques actifs

- autorisation admin appliquée aux actions sensibles, au dashboard et aux uploads ;
- secret d’authentification local remplacé et placeholder sécurisé dans `.env.example` ;
- API de suivi réduite et protégée par un rate limiting ;
- rate limiting persistant en base avec TTL et nettoyage possible ;
- validation stricte des dons et des détails administratifs via Zod ;
- soumission donateur rendue transactionnelle pour éviter un donateur orphelin ;
- échec email journalisé et signalé à l’utilisateur sur la page de confirmation ;
- correction des types de génération PDF ;
- aperçu immédiat et suppression avant envoi pour les photos de preuve ;
- rafraîchissement automatique après upload ;
- résolution sécurisée des chemins et inclusion des preuves dans le PDF ;
- CSP et headers de sécurité présents ;
- information UX sur la protection des données ajoutée à `/suivi` ;
- build Next.js de production validé.

## 3. Risques encore ouverts

### 3.1 Suivi public avec référence seule

**Fichier :** `src/app/api/dons/[reference]/route.ts`  
**Gravité :** moyenne

Une personne qui obtient une référence peut encore consulter le nom et le prénom associés. Les PII principales sont retirées et un rate limiting est en place, mais la référence seule n’est pas une authentification forte.

**Action restante :** ajouter un code secondaire ou une confirmation par email.

### 3.2 Absence de tests automatisés

**Gravité :** moyenne

Les chemins critiques ne disposent pas encore d’une couverture de tests visible : auth, actions admin, soumission de don, API, upload et génération PDF.

**Action restante :** ajouter les tests unitaires et d’intégration avant de viser 99/100.

### 3.3 Export CSV et dashboard à surveiller

**Gravité :** faible à moyenne

L’export admin charge jusqu’à 1 000 lignes en mémoire et le dashboard réalise plusieurs requêtes. C’est acceptable pour le volume actuel, mais doit être mesuré et paginé si le volume augmente.

### 3.4 CSP à durcir

**Fichier :** `next.config.mjs`  
**Gravité :** faible

La CSP protège maintenant l’application, mais autorise encore `unsafe-inline`, `unsafe-eval` et des sources larges pour rester compatible avec les dépendances actuelles.

**Action restante :** réduire ces exceptions après audit des scripts utilisés en production.

## 4. Score par domaine

| Domaine | Score |
|---|---:|
| Sécurité | 93/100 |
| Fiabilité production | 93/100 |
| Performance | 84/100 |
| UX/UI | 90/100 |
| Maintenabilité | 84/100 |

**Score global : 94/100**

## 5. Préparation au déploiement

Avant le lancement :

1. définir `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY` et `EMAIL_FROM` dans le gestionnaire de secrets ;
2. ne pas copier `.env` sur le dépôt ou dans l’image publique ;
3. vérifier les permissions d’écriture de `public/uploads` si le stockage local est conservé ;
4. tester l’envoi email, l’upload, le suivi, la validation admin et la génération de fiche avec 0, 1 et 2 preuves sur l’environnement cible ;
5. activer une surveillance des erreurs et des logs.

## 6. Objectif 99/100

Pour atteindre 99/100 :

- ajouter une vérification secondaire au suivi public ;
- ajouter les tests automatisés des flux critiques ;
- optimiser l’export CSV et mesurer le dashboard ;
- durcir la CSP ;
- réaliser un scan de dépendances et un test de pénétration ciblé ;
- valider le déploiement réel, les migrations, les sauvegardes et la restauration.
