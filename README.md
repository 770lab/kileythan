# Kileyt — cockpit du cabinet comptable (clone UX statique)

Reproduction statique fidèle, rebrandée **Kileyt**, de l'expérience Teradion, avec une UX enrichie
(parallax, scroll-reveal, transitions). 100% statique, hébergé sur GitHub Pages.

**URL :** https://770lab.com/kileythan/

## Stack
- HTML/CSS/JS vanilla, aucun build.
- Design system shadcn-like (navy `hsl(218 54% 11%)` + gold `hsl(48 100% 61%)`), police **Manrope**.
- L'app (`/app/`) est une SPA à hash-router ; données de **test** en `localStorage` (réinitialisables).

## Structure
- `index.html`, `fonctionnalites.html`, `cas-usage.html`, `tarifs.html`, `faq.html` — site marketing.
- `app/` — application (tableau de bord, échéances, synthèse, CRM, tâches, GED, messagerie, etc.).
- `assets/css/kileyt.css` — design system. `assets/js/` — shell, router, écrans, données.

> Démo UX. Pas de backend : aucune connexion réelle à impots.gouv / INPI. Données fictives.
