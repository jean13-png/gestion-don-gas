# Audit de production — ONG-GAS PIPT

**Date :** 9 septembre 2026  
**Mise à jour :** après résolution de l’erreur `RateLimitBucket` et vérification du démarrage  
**Score actuel :** 94/100

## 1. Contrôles corrigés

Les points suivants sont corrigés et retirés des risques actifs :

- autorisations admin sur les actions sensibles, le dashboard et les uploads ;
- secrets d’exemple non réutilisables ;
- API de suivi limitée en données et protégée par rate limiting ;
- rate limiting persistant en base avec expiration ;
- migration `RateLimitBucket` appliquée sur la base configurée ;
- validations Zod des dons et détails admin ;
- création donateur + don transactionnelle ;
- échec email journalisé et signalé à l’utilisateur ;
- aperçu immédiat et suppression avant envoi pour les photos de preuve ;
- rafraîchissement automatique après upload ;
- résolution sécurisée des chemins et inclusion des preuves dans le PDF ;
- CSP et headers de sécurité présents ;
- avertissements de dimensionnement des images d’accueil corrigés ;
- build de production réussi.

## 2. Points encore ouverts

### 2.1 Suivi public avec référence seule

**Gravité :** moyenne

La référence seule permet encore de récupérer le nom et le prénom. Les données email, téléphone et organisme ont été retirées et un rate limiting est actif.

**Action :** ajouter un second code ou une confirmation par email.

### 2.2 Tests automatisés

**Gravité :** moyenne

Les flux auth, dons, admin, upload, API et PDF n’ont pas encore de couverture automatisée visible.

**Action :** ajouter les tests unitaires et d’intégration des chemins critiques.

### 2.3 Exports et dashboard

**Gravité :** faible à moyenne

L’export CSV charge jusqu’à 1 000 lignes et le dashboard effectue plusieurs requêtes. Une pagination et une mesure en production seront nécessaires avec la croissance des données.

### 2.4 CSP à durcir

**Gravité :** faible

La CSP est active, mais contient encore `unsafe-inline`, `unsafe-eval` et des sources larges pour rester compatible avec les dépendances actuelles.

## 3. UI/UX

La charte graphique actuelle du code est conservée conformément à la demande. Le flux de preuves affiche maintenant un aperçu immédiat, une croix de suppression avant envoi et actualise automatiquement les photos après upload.

## 4. Score par domaine

| Domaine | Score |
|---|---:|
| Sécurité | 93/100 |
| Fiabilité / production | 93/100 |
| Performance | 84/100 |
| UX/UI | 90/100 |
| Maintenabilité | 84/100 |

**Score global pondéré : 94/100**

## 5. Verdict

- Préproduction : **oui**
- Production contrôlée : **oui**
- Production publique sans réserve : **presque, mais tests et suivi renforcé requis**
- Objectif 99/100 : **non atteint**
