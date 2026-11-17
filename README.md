# Fama-Ferme

Application web interne et mobile-first pour le suivi technique, sanitaire, financier et la gestion des stocks d'une ferme avicole et agricole personnelle.

Conçue spécifiquement pour répondre aux exigences du **Cahier des Charges - Fama-Ferme (Usage Personnel)**. La devise de référence est le **franc CFA (FCFA / XOF)**.

---

## 🌾 Fonctionnalités & Modules

### 1. Sites & Infrastructures (Gestion Spatiale)
- **Sites physiques** : localisation, description et affectation des bâtiments.
- **Bâtiments / Poulaillers** : suivi des poulaillers (pondeuses, poussinières, chair) et capacités maximales.
- **Magasins de stockage** : magasin central d'aliments et magasin de vente des œufs.

### 2. Bandes de Sujets (Cheptel)
- Enregistrement des lots (ex: *Bande Pondeuses Nov 2025*, *Bande Poulets Chair Jan 2026*).
- Paramètres : Date d'arrivée, effectif initial, souche/race (Lohmann Brown, Cobb 500, Goliath...), coût unitaire poussin.
- **Calcul automatique en temps réel de l'effectif vivant** (effectif initial déduit des mortalités déclarées).

### 3. Saisie Quotidienne Terrain (Mobile-First)
- **Collecte des œufs** : Saisie journalière des œufs valides (intacts) et œufs cassés/fêlés. Calcul automatique du taux de casse (%) et du taux de ponte journalier.
- **Mortalité** : Déclaration journalière des pertes et symptômes constatés (chaleur, maladie, etc.).
- **Alimentation** : Saisie du poids distribué (kg) et déduction automatique du stock d'aliment.
- **Soins & Hygiène** : Traitements vétérinaires, vaccins et nettoyages effectués.

### 4. Tableau de Bord & Graphiques (KPIs)
- **Indicateurs clés** : Nombre de bandes actives, effectif total vivant, ponte du jour, taux de ponte, chiffre d'affaires du mois.
- **Graphiques interactifs (Chart.js)** :
  - Courbe de production d'œufs (7 ou 30 derniers jours) avec comparaison œufs intacts vs cassés.
  - Courbe de mortalité journalière.
  - Bilan mensuel : Ventes (Entrées) vs Dépenses (Sorties).
- **Alertes de stock bas** : Badges d'alerte lorsque les aliments ou vaccins passent sous le seuil critique.

### 5. Gestion des Stocks & Magasins
- Suivi des aliments (sacs 50kg ou kg), produits vétérinaires, emballages/alvéoles et stock d'œufs prêts à la vente.
- Enregistrement manuel des entrées (achats) et sorties (consommations, pertes).

### 6. Ventes Directes & Facturation
- Enregistrement des ventes directes (œufs en plateaux de 30 ou détails, poulets vifs, fientes séchées).
- Fiches clients (boutiques de quartier, grossistes, particuliers).
- Modes de règlement : Espèces, Orange Money, Wave, Virement, Crédit.
- **Reçu / Facture imprimable** : Générateur de facture officielle au format imprimable ou exportable en PDF (`window.print()`).

### 7. Suivi Financier & Bilan d'Exploitation
- Enregistrement des dépenses : aliments, salaires des ouvriers, soins vétérinaires, eau/électricité, transport.
- Calcul en direct du résultat net d'exploitation (Recettes - Dépenses = Marge).
- Ventilation des charges par poste.

### 8. Contrôle des Accès (Rôles)
- 👑 **Mode Propriétaire (Admin)** : Accès complet (finance, configuration, suppression, bilan de rentabilité).
- 🚜 **Mode Agent Terrain** : Interface simplifiée pour les gérants et ouvriers, centrée sur la saisie journalière rapide et la vente directe au comptoir.

### 9. Mode Hors-Ligne & Sauvegarde
- Les saisies sont conservées sur l'appareil grâce à `localStorage` (clé `fama-ferme-data-v1`).
- Le service worker met en cache l'application pour permettre son ouverture hors ligne après un premier chargement connecté.
- L'application web est installable comme PWA sur les navigateurs compatibles ; l'état de connexion est affiché dans l'en-tête.
- Bouton **Export JSON** pour sauvegarder l'intégralité des données sur son téléphone ou PC.
- Bouton **Import JSON** pour restaurer ou synchroniser les données.

---

## 🚀 Démarrer le Projet

```sh
cd fama-ferme
npm install
npm run dev
```

Pour compiler l'application :
```sh
npm run build
```
