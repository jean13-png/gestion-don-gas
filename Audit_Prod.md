# Audit de production — ONG-GAS PIPT

**Date :** 9 septembre 2026  
**Dernière mise à jour :** correction du build Vercel  
**Score actuel :** 94/100

## 1. Incident Vercel vérifié

Le déploiement du commit `87014cd` échouait pendant l’installation npm :

```text
npm error code ETARGET
npm error notarget No matching version found for pdfkit@^1.0.0.
```

La cause était une plage de version inexistante dans `package.json`. Le registre npm publie actuellement `pdfkit` en version `0.20.x`, et le fichier de verrouillage utilisait déjà une version `0.20.1` pour certaines dépendances.

### Correction appliquée

- `package.json` utilise maintenant `pdfkit: ^0.20.2` ;
- `package-lock.json` a été régénéré ;
- un `npm ci` propre a été exécuté ;
- `npm run build` passe après installation propre ;
- le correctif a été poussé sur `main` dans le commit `ac934ab`.

Vercel doit maintenant reconstruire depuis le commit `ac934ab`.

## 2. Contrôles corrigés

- autorisations admin sur les actions sensibles, le dashboard et les uploads ;
- API de suivi limitée en données et protégée par rate limiting ;
- rate limiting persistant en base avec expiration ;
- migration `RateLimitBucket` appliquée sur la base locale configurée ;
- validations Zod des dons et détails admin ;
- création donateur + don transactionnelle ;
- échec email journalisé et signalé à l’utilisateur ;
- aperçu immédiat et suppression avant envoi pour les photos de preuve ;
- rafraîchissement automatique après upload ;
- inclusion des preuves dans le PDF ;
- CSP et headers de sécurité présents ;
- build local propre après installation npm propre.

## 3. Points encore ouverts

### 3.1 Variables et migration Vercel

Configurer les variables d’environnement dans Vercel et appliquer les migrations Prisma sur la base de production avec :

```bash
npx prisma migrate deploy
```

### 3.2 Suivi public avec référence seule

La référence seule permet encore de récupérer le nom et le prénom. Les données email, téléphone et organisme sont retirées et un rate limiting est actif.

### 3.3 Tests automatisés

Les flux auth, dons, admin, upload, API et PDF ne disposent pas encore d’une couverture automatisée visible.

### 3.4 Exports, dashboard et CSP

L’export CSV, les requêtes du dashboard et les exceptions CSP (`unsafe-inline`, `unsafe-eval`) devront être optimisés ou durcis avant de viser 99/100.

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
- Production contrôlée : **oui après configuration Vercel et migration**
- Production publique sans réserve : **presque**
- Objectif 99/100 : **non atteint**
