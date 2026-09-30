/**
 * TAGGO — Configuration centralisée.
 * Tout ce qui est remplaçable (assets, textes, palette, liens) vit ici.
 */

export const CONFIG = {
  assets: {
    modelUrl: 'assets/TAGGO-Tshirt.glb',
    qrUrl: 'assets/TAGGO-QR.png',
    logoFull: 'assets/taggo-logo-full-colored.png',
    logoDark: 'assets/taggo-logo-full-dark.png',
    icon: 'assets/taggo-icon-colored.png',
  },
  colors: {
    bg: 0x0B1320,
    fog: 0x0B1320,
    keyLight: 0xF5E1DA,
    fillLight: 0x6F2DA8,
    rimLight: 0x4CC9F0,
  },
  camera: { fov: 38, near: 0.1, far: 60 },
  render: { maxDprDesktop: 1.75, maxDprMobile: 1.25 },
  heroScrollVh: { desktop: 620, mobile: 420 },
  // TODO(backend) : URL réelle de création / d'inscription
  ctaUrl: '#creer',
};

/**
 * TIMELINE CENTRALE — UNE SEULE PROGRESSION (0 → 1).
 *
 *   0.00 → 0.10   Scène 01 : face avant, travelling avant
 *   0.10 → 0.20   Scène 02 : rotation 180° (face → dos)
 *   0.20 → 0.30   Scène 03 : dos, QR visible, "Un scan suffit."
 *   0.30 → 0.45   Scène 04 : approche caméra vers le QR
 *   0.45 → 0.55   Scène 05 : traversée du QR → univers numérique
 *   0.55 → 0.65   Scène 06 : page TAGGO
 *   0.65 → 0.72   Scène 07 : personnalisation
 *   0.72 → 0.80   Scène 08 : dashboard
 *   0.80 → 0.88   Scène 09 : usages
 *   0.88 → 0.94   Scène 10 : retour au T-shirt
 *   0.94 → 1.00   Scène 11 : CTA final
 *
 * Chaque clé : { t, pos:[x,y,z], look:[x,y,z], rotY, shirt }
 * rotY en radians (2π = un tour complet, retour à la vue de départ).
 * shirt = opacité du T-shirt (permet de le faire disparaître/revenir sans flash).
 */

export const TIMELINE_KEYS = [
  { t: 0.00, pos: [ 1.50, 0.40, 4.80], look: [0, 0.15, 0], rotY: 0.50,           shirt: 1 },
  { t: 0.10, pos: [ 1.15, 0.32, 4.05], look: [0, 0.15, 0], rotY: 0.40,           shirt: 1 },
  { t: 0.20, pos: [ 1.15, 0.32, 4.05], look: [0, 0.15, 0], rotY: Math.PI + 0.40, shirt: 1 },
  { t: 0.30, pos: [ 0.65, 0.30, 3.50], look: [0, 0.20, 0], rotY: Math.PI + 0.15, shirt: 1 },
  { t: 0.45, pos: [ 0.00, 0.30, 1.90], look: [0, 0.30, 0.20], rotY: Math.PI,      shirt: 1 },
  { t: 0.52, pos: [ 0.00, 0.30, 0.85], look: [0, 0.30, 0.30], rotY: Math.PI,      shirt: 1 },
  // Univers numérique : le T-shirt s'estompe pendant la traversée, caméra stabilisée au loin
  { t: 0.58, pos: [ 0.00, 0.40, 6.00], look: [0, 0.20, 0], rotY: Math.PI,         shirt: 0 },
  { t: 0.86, pos: [ 0.00, 0.40, 6.00], look: [0, 0.20, 0], rotY: Math.PI + 0.25,  shirt: 0 },
  // Scène 10 : retour au produit physique, la caméra recule
  { t: 0.90, pos: [ 0.60, 0.35, 4.60], look: [0, 0.15, 0], rotY: Math.PI + 0.50,  shirt: 1 },
  { t: 0.94, pos: [ 1.50, 0.40, 4.80], look: [0, 0.15, 0], rotY: Math.PI * 2 + 0.50, shirt: 1 },
  { t: 1.00, pos: [ 1.50, 0.40, 4.80], look: [0, 0.15, 0], rotY: Math.PI * 2 + 0.50, shirt: 1 },
];

/**
 * Traversée du QR (DOM) :
 *  - phase A (tA_start → tA_peak)  : le QR grandit depuis le dos du T-shirt
 *  - phase B (tA_peak → tB_end)    : le QR s'efface pour révéler l'interface
 */
export const QR_DIVE = {
  start: 0.44,
  peak: 0.52,
  end: 0.57,
  scaleStart: 0.34,
  scalePeak: 2.4,
};

/** Fenêtres d'opacité des overlays de texte [début, fin] (fondu doux inclus). */
export const OVERLAY_WINDOWS = {
  intro:    [0.02, 0.10],
  qrText:   [0.22, 0.30],
  page:     [0.57, 0.65],
  perso:    [0.66, 0.72],
  dash:     [0.73, 0.80],
  usages:   [0.81, 0.88],
  cta:      [0.94, 1.01],
};
