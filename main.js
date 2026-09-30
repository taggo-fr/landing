/**
 * TAGGO — Orchestration du hero.
 * Une seule source de vérité : la progression du scroll (0 → 1),
 * lissée, qui pilote la caméra 3D, la traversée du QR et les overlays.
 * Aucun système d'animation indépendant.
 */

import { CONFIG } from './config.js';
import { sampleQrDive, overlayOpacity, sampleSwap } from './timeline.js';

const hero = document.getElementById('hero');
const canvas = document.getElementById('hero-canvas');
const loader = document.getElementById('hero-loader');
const fallback = document.getElementById('hero-fallback');
const qrDiveEl = document.getElementById('qr-dive');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Active la version statique (fallback élégant) et stoppe tout le reste. */
function activateStaticFallback() {
  document.body.classList.add('static-hero');
  fallback.hidden = false;
  loader.style.display = 'none';
  canvas.style.display = 'none';
  qrDiveEl.style.display = 'none';
  document.querySelectorAll('.scene-overlay, .scroll-hint').forEach((el) => (el.style.display = 'none'));
}

/** WebGL disponible ? */
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/* ---------- Mode statique : reduced-motion OU WebGL indisponible ---------- */
if (reducedMotion || !webglAvailable()) {
  activateStaticFallback();
} else {
  initExperience();
}

async function initExperience() {
  // Mobile : hero raccourci (storytelling identique, moins de scroll)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  hero.style.height = `${isMobile ? CONFIG.heroScrollVh.mobile : CONFIG.heroScrollVh.desktop}vh`;

  const { createHeroScene } = await import('./hero3d.js');
  const scene = createHeroScene(canvas);

  // Cache des overlays
  const overlays = Array.from(document.querySelectorAll('.scene-overlay')).map((el) => ({
    el,
    window: (el.dataset.window || '0,0').split(',').map(Number),
  }));
  const swapA = document.querySelector('.swap-a');
  const swapB = document.querySelector('.swap-b');

  // ---- Progression unique (cible) + lissage ----
  let target = 0;
  let current = 0;

  function readScroll() {
    const rect = hero.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    target = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll);
  readScroll();

  function applyOverlays(t) {
    for (const { el, window: w } of overlays) {
      el.style.opacity = overlayOpacity(t, w).toFixed(3);
    }
    if (swapA && swapB) {
      const s = sampleSwap(t);
      swapA.style.opacity = s.a.toFixed(3);
      swapB.style.opacity = s.b.toFixed(3);
    }
    const q = sampleQrDive(t);
    qrDiveEl.style.opacity = q.opacity.toFixed(3);
    qrDiveEl.firstElementChild.style.transform = `scale(${q.scale.toFixed(3)})`;
  }

  // ---- Boucle unique ----
  function tick() {
    // Lissage : mouvement fluide même sur scroll par à-coups
    current += (target - current) * 0.09;
    if (Math.abs(target - current) < 0.0004) current = target;

    scene.setProgress(current);
    scene.renderFrame();
    applyOverlays(current);

    requestAnimationFrame(tick);
  }

  canvas.addEventListener('taggo:model-ready', () => {
    loader.style.display = 'none';
  }, { once: true });

  // Sécurité : si le GLB met trop de temps, ne pas bloquer la page
  setTimeout(() => { loader.style.display = 'none'; }, 12000);

  tick();
}
