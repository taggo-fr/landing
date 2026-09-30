# TAGGO — Landing Page

Landing officielle de **TAGGO** : le T-shirt qui connecte le physique au numérique.

## Lancer en local

Un simple serveur statique suffit (les modules ES nécessitent http) :

```bash
cd landing
python3 -m http.server 8080
# → http://localhost:8080
```

Three.js est chargé via CDN (importmap) ; le GLB et le QR sont servis localement depuis `assets/`.

## Structure

```
index.html          Page unique — tout le contenu SEO lisible dans le HTML
css/styles.css      Design system TAGGO
js/config.js        Assets, palette, timeline centrale (seul endroit à modifier)
js/timeline.js      Interpolation (smoothstep) — un seul système d'animation
js/hero3d.js        Scène Three.js (consomme la timeline, aucune animation libre)
js/main.js          Scroll → progression unique → 3D + overlays + fallback
assets/             GLB officiel, QR officiel, logos (ne jamais régénérer)
```

## Règles absolues

- Le modèle `TAGGO-Tshirt.glb` est le SEUL modèle autorisé.
- Le QR `TAGGO-QR.png` ne doit jamais être régénéré ni déformé.
- Une seule timeline : `progress ∈ [0,1]` pilote caméra, rotation, opacités et overlays.
- Pas de secrets dans le frontend. Les liens de création sont des placeholders `TODO(backend)`.
