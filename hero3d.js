/**
 * TAGGO — Scène 3D du hero.
 * Le modèle GLB officiel est chargé tel quel (jamais recréé, jamais remplacé).
 * Tout mouvement vient de la timeline centrale (sampleTimeline) — aucune
 * animation indépendante, aucune rotation décorative.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './config.js';
import { sampleTimeline } from './timeline.js';

export function createHeroScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const maxDpr = isMobile ? CONFIG.render.maxDprMobile : CONFIG.render.maxDprDesktop;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.bg);
  scene.fog = new THREE.Fog(CONFIG.colors.fog, 9, 22);

  const camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, 1, CONFIG.camera.near, CONFIG.camera.far);

  // ---- Lumières : douces, premium — pas d'esthétique cyberpunk ----
  scene.add(new THREE.HemisphereLight(0xF5E1DA, 0x301934, 0.55));

  const key = new THREE.DirectionalLight(CONFIG.colors.keyLight, 2.2);
  key.position.set(3, 5, 4);
  key.castShadow = !isMobile;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -3;
  key.shadow.camera.right = key.shadow.camera.top = 3;
  scene.add(key);

  const fill = new THREE.DirectionalLight(CONFIG.colors.fillLight, 0.8);
  fill.position.set(-4, 1, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(CONFIG.colors.rimLight, 1.1);
  rim.position.set(0, 3, -5);
  scene.add(rim);

  // ---- Sol : ombre douce uniquement ----
  if (!isMobile) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.25;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  // ---- Modèle officiel TAGGO ----
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  let modelReady = false;
  let modelMaterials = [];

  new GLTFLoader().load(CONFIG.assets.modelUrl, (gltf) => {
    const model = gltf.scene;

    // Normaliser l'échelle : hauteur ≈ 2.2 unités, centré sur l'origine
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 2.2 / Math.max(size.y, 0.0001);
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.position.y += 0.05;

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = !isMobile;
        node.receiveShadow = false;
        if (node.material) {
          // Opacité pilotable pour la traversée QR (sans flash, sans portail)
          node.material.transparent = true;
          node.material.needsUpdate = true;
          modelMaterials.push(node.material);
        }
      }
    });

    modelGroup.add(model);
    modelReady = true;
    canvas.dispatchEvent(new CustomEvent('taggo:model-ready'));
  });

  // ---- Boucle de rendu : UNE timeline → UNE frame ----
  let progress = 0;

  function setProgress(p) { progress = p; }

  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();

  function renderFrame() {
    const s = sampleTimeline(progress);

    camPos.set(s.pos[0], s.pos[1], s.pos[2]);
    camLook.set(s.look[0], s.look[1], s.look[2]);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    modelGroup.rotation.y = s.rotY;

    if (modelReady) {
      for (const m of modelMaterials) m.opacity = s.shirt;
      modelGroup.visible = s.shirt > 0.003;
    }

    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', () => { resize(); renderFrame(); });
  resize();

  return {
    setProgress,
    renderFrame,
    resize,
    get isReady() { return modelReady; },
  };
}
