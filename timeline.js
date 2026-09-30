/**
 * TAGGO — Interpolation de la timeline centrale.
 * Un seul système : progress ∈ [0,1] → caméra + rotation + opacité du T-shirt.
 */

import { TIMELINE_KEYS, QR_DIVE } from './config.js';

const smooth = (x) => x * x * (3 - 2 * x); // smoothstep — mouvements premium, sans à-coups
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;

function lerp3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/**
 * Échantillonne la timeline à un instant t.
 * Retourne { pos:[x,y,z], look:[x,y,z], rotY, shirt }.
 */
export function sampleTimeline(t) {
  t = clamp01(t);
  const keys = TIMELINE_KEYS;

  if (t <= keys[0].t) return { ...snapshot(keys[0]) };
  const last = keys[keys.length - 1];
  if (t >= last.t) return { ...snapshot(last) };

  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].t <= t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const f = smooth((t - a.t) / (b.t - a.t));

  return {
    pos: lerp3(a.pos, b.pos, f),
    look: lerp3(a.look, b.look, f),
    rotY: lerp(a.rotY, b.rotY, f),
    shirt: lerp(a.shirt, b.shirt, f),
  };
}

function snapshot(k) {
  return { pos: [...k.pos], look: [...k.look], rotY: k.rotY, shirt: k.shirt };
}

/**
 * État de la traversée du QR (overlay DOM).
 * Retourne { opacity, scale } — 0 hors de la phase.
 */
export function sampleQrDive(t) {
  if (t <= QR_DIVE.start || t >= QR_DIVE.end) return { opacity: 0, scale: QR_DIVE.scaleStart };

  if (t < QR_DIVE.peak) {
    const f = smooth((t - QR_DIVE.start) / (QR_DIVE.peak - QR_DIVE.start));
    return { opacity: f, scale: lerp(QR_DIVE.scaleStart, QR_DIVE.scalePeak, f) };
  }
  // Phase de sortie : le QR s'efface, l'interface apparaît derrière
  const f = smooth((t - QR_DIVE.peak) / (QR_DIVE.end - QR_DIVE.peak));
  return { opacity: 1 - f, scale: lerp(QR_DIVE.scalePeak, QR_DIVE.scalePeak * 1.05, f) };
}

/**
 * Opacité d'un overlay de texte selon sa fenêtre [start, end].
 * Montée et descente sur ~35 % de la fenêtre, plateau au milieu.
 */
export function overlayOpacity(t, [start, end]) {
  if (t <= start || t >= end) return 0;
  const span = end - start;
  const ramp = span * 0.35;
  if (t < start + ramp) return smooth((t - start) / ramp);
  if (t > end - ramp) return smooth((end - t) / ramp);
  return 1;
}

/**
 * Sous-animation de la scène 07 (personnalisation) :
 * Instagram s'efface, WhatsApp apparaît — toujours pilotée par la progression.
 */
export function sampleSwap(t) {
  // transition nette au milieu de la fenêtre perso
  const f = smooth(clamp01((t - 0.685) / 0.02));
  return { a: 1 - f, b: f };
}

export const clamp = clamp01;
