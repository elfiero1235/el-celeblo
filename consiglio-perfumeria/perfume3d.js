// Frasco de perfume 3D (three.js): vidrio con refracción real, líquido que se mueve, atomizador dorado.
// El canvas ocupa todo el hero (detrás del texto) para que el vidrio refracte el fondo de verdad.
// Si WebGL no está disponible, queda el frasco SVG de respaldo.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const hero = document.querySelector('.hero');
const stage = document.querySelector('.hero__stage');
const canvas = document.createElement('canvas');
canvas.className = 'perfume3d';
hero.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
document.documentElement.classList.add('has-3d');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfaf8f4); // mismo blanco cálido que la página

// estudio oscuro con softboxes: el vidrio refleja tiras de luz nítidas
function studio() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x050403);
  const box = (w, h, color, intensity, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  box(1.4, 10, 0xfff3dc, 6, -5, 1, 3);   // tira alta izquierda
  box(0.8, 10, 0xffdca0, 4, 5, 0, 2);    // tira derecha cálida
  box(9, 1.2, 0xffffff, 3, 0, 6, 0);     // cenital
  box(5, 3, 0xc9a96a, 1.5, 0, -1, -6);   // rebote dorado de fondo
  return env;
}
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(studio(), 0.02).texture;

const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
camera.position.set(0, 0, 9);

const key = new THREE.DirectionalLight(0xffe2b0, 2.4); key.position.set(3, 5, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0xc9a96a, 3); rim.position.set(-4, 2, -3); scene.add(rim);
const sweep = new THREE.PointLight(0xfff1d6, 30, 14); scene.add(sweep);
scene.add(new THREE.AmbientLight(0x2a2016, 1));

function radial(inner, outer, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// resplandor dorado detrás del frasco: es lo que el vidrio refracta
const glow = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: radial('rgba(222,196,140,.35)', 'rgba(250,248,244,0)'), transparent: true, depthWrite: false, toneMapped: false }));
glow.position.z = -4; scene.add(glow);
const glow2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: radial('rgba(255,244,222,.8)', 'rgba(255,244,222,0)'), transparent: true, depthWrite: false, toneMapped: false }));
glow2.position.z = -2.5; scene.add(glow2);

// ---------- frasco ----------
const W = 1.75, H = 2.15, D = 1.0;
const rig = new THREE.Group();     // posición y escala
const bottle = new THREE.Group();  // rotación
rig.add(bottle); scene.add(rig);

const glass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 1, thickness: 1.1, ior: 1.5,
  clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.3, specularIntensity: 1,
  attenuationColor: new THREE.Color(0xf6ead2), attenuationDistance: 3,
});
// el vidrio no escribe profundidad: así el líquido (transparente, se dibuja después) se ve a través
glass.depthWrite = false;
bottle.add(new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 8, 0.24), glass));

// líquido: caja interna recortada por un plano que siempre queda casi horizontal.
// Es translúcido, con degradé de miel clara (arriba) a ámbar profundo (abajo).
const LH = H - 0.3;
const liquidGeo = new RoundedBoxGeometry(W - 0.26, LH, D - 0.24, 6, 0.16);
{
  const deep = new THREE.Color(0x7a3006), honey = new THREE.Color(0xf7c56a), c = new THREE.Color();
  const p = liquidGeo.attributes.position, cols = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    c.copy(deep).lerp(honey, Math.pow(THREE.MathUtils.clamp(p.getY(i) / LH + 0.5, 0, 1), 0.8));
    cols.set([c.r, c.g, c.b], i * 3);
  }
  liquidGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
}
const surface = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
const liquidMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, vertexColors: true, emissive: 0x6b2c05, emissiveIntensity: 0.35,
  roughness: 0.06, metalness: 0, transparent: true, opacity: 0.78, depthWrite: false,
  clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 1.6,
  sheen: 0.6, sheenColor: new THREE.Color(0xffd79a),
  clippingPlanes: [surface], side: THREE.DoubleSide,
});
const liquid = new THREE.Mesh(liquidGeo, liquidMat);
liquid.position.y = 0.04; // vidrio del fondo apenas más grueso
liquid.renderOrder = 2;
bottle.add(liquid);

// superficie del líquido: un disco brillante que sigue al plano de corte (menisco)
const meniscus = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshPhysicalMaterial({
  color: 0xffd98c, emissive: 0x8a4a10, emissiveIntensity: 0.4, roughness: 0.02, transparent: true, opacity: 0.55,
  depthWrite: false, side: THREE.DoubleSide, clearcoat: 1, envMapIntensity: 2,
}));
meniscus.renderOrder = 3;
scene.add(meniscus);

const gold = new THREE.MeshPhysicalMaterial({ color: 0xd8b36e, metalness: 1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 1.6 });
const darkGold = new THREE.MeshPhysicalMaterial({ color: 0x8a6a3a, metalness: 1, roughness: 0.35 });

const top = H / 2;
const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.26, 64), gold);
collar.position.y = top + 0.13; bottle.add(collar);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 16, 64), darkGold);
ring.rotation.x = Math.PI / 2; ring.position.y = top + 0.02; bottle.add(ring);
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 24), darkGold);
stem.position.y = top + 0.34; bottle.add(stem);

const actuator = new THREE.Group();
actuator.position.y = top + 0.56; bottle.add(actuator);
actuator.add(new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.4, 64), gold));
const actTop = new THREE.Mesh(new THREE.SphereGeometry(0.27, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), gold);
actTop.scale.y = 0.35; actTop.position.y = 0.2; actuator.add(actTop);
const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
nozzle.rotation.z = Math.PI / 2; nozzle.position.set(0.27, 0.04, 0); actuator.add(nozzle);
const nozzleTip = new THREE.Object3D(); nozzleTip.position.set(0.32, 0.04, 0); actuator.add(nozzleTip);

// etiqueta con el logo
// Se dibuja a 4x (4096 px de ancho) para que se vea nítida aunque el frasco se acerque.
function labelTexture() {
  const S = 4;
  const c = document.createElement('canvas'); c.width = 1024 * S; c.height = 440 * S;
  const g = c.getContext('2d');
  g.scale(S, S);
  // etiqueta negra laqueada con doble filete dorado
  const black = g.createLinearGradient(0, 0, 0, 440);
  black.addColorStop(0, '#1c1a18'); black.addColorStop(.5, '#0b0a09'); black.addColorStop(1, '#151311');
  g.fillStyle = black;
  g.beginPath(); g.roundRect(6, 6, 1012, 428, 18); g.fill();
  const goldLine = g.createLinearGradient(0, 0, 1024, 0);
  goldLine.addColorStop(0, '#9c7b3e'); goldLine.addColorStop(.5, '#ecd6a0'); goldLine.addColorStop(1, '#9c7b3e');
  g.strokeStyle = goldLine; g.lineWidth = 5; g.stroke();
  g.lineWidth = 1.6;
  g.beginPath(); g.roundRect(28, 28, 968, 384, 10); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const silver = g.createLinearGradient(0, 140, 0, 250);
  silver.addColorStop(0, '#fbf9f5'); silver.addColorStop(1, '#b4b0a9');
  g.fillStyle = silver; g.font = '500 132px "Cormorant Garamond", Georgia, serif';
  g.letterSpacing = '26px'; g.fillText('CONSIGLIO', 525, 250);
  // separador fino entre la marca y el subtítulo
  g.fillStyle = goldLine; g.fillRect(392, 284, 240, 1.6);
  g.fillStyle = '#d9bf85'; g.font = '600 38px Manrope, sans-serif';
  g.letterSpacing = '22px'; g.fillText('PERFUMERÍAS', 523, 340);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  return t;
}
const labelMat = new THREE.MeshPhysicalMaterial({ map: labelTexture(), roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.6 });
const label = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.57), labelMat);
label.position.set(0, -0.2, D / 2 + 0.004); bottle.add(label);
// se redibuja cuando cargan las tipografías (si no, sale con la de respaldo)
Promise.all([
  document.fonts.load('500 132px "Cormorant Garamond"'),
  document.fonts.load('600 38px Manrope'),
]).catch(() => {}).then(() => { labelMat.map.dispose(); labelMat.map = labelTexture(); labelMat.needsUpdate = true; });

// sombra suave
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.1), new THREE.MeshBasicMaterial({ map: radial('rgba(70,50,20,.38)', 'rgba(70,50,20,0)', 128), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; rig.add(shadow);

// polvo dorado
const N = 320, pos = new Float32Array(N * 3), seed = new Float32Array(N);
for (let i = 0; i < N; i++) {
  pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
  seed[i] = Math.random() * 10;
}
const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  size: 0.05, map: radial('rgba(255,236,190,1)', 'rgba(255,236,190,0)', 64), transparent: true,
  depthWrite: false, color: 0xc4a064,
}));
scene.add(dust);

// ---------- tamaño y ubicación: el frasco va donde está .hero__stage ----------
const anchor = { x: 0, y: 0, scale: 1 };
function resize() {
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), visW = visH * camera.aspect;
  const hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect();
  const cx = sr.left - hr.left + sr.width / 2, cy = sr.top - hr.top + sr.height / 2;
  anchor.x = (cx / w - 0.5) * visW;
  anchor.y = -(cy / h - 0.5) * visH - 0.25;
  // el frasco (≈3.4 de alto con atomizador) ocupa ~78% del alto del escenario
  anchor.scale = (Math.min(sr.height, sr.width * 1.3) * 0.78 / h * visH) / 3.4;
  glow.position.x = glow2.position.x = anchor.x;
  glow.position.y = glow2.position.y = anchor.y + 0.3;
}
resize(); addEventListener('resize', resize);
new ResizeObserver(resize).observe(hero);

// ---------- movimiento ----------
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

const START = 1.8; // segundos: arranca mientras se desvanece la intro
const easeOut = k => 1 - Math.pow(1 - k, 4);
let press = 0, slosh = 0, sloshV = 0, prevRotY = 0, last = performance.now(), visible = true;
const clock = new THREE.Clock();
const tmp = new THREE.Vector3(), up = new THREE.Vector3(), pt = new THREE.Vector3();
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

function frame() {
  requestAnimationFrame(frame);
  if (!visible) return;
  const t = clock.getElapsedTime();
  const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now;

  pointer.sx += (pointer.x - pointer.sx) * 0.05;
  pointer.sy += (pointer.y - pointer.sy) * 0.05;
  const scroll = Math.min(scrollY / innerHeight, 1.2);

  // entrada: sube girando desde abajo mientras la intro se desvanece
  const k = easeOut(Math.min(Math.max((t - START) / 2.8, 0), 1));
  const s = anchor.scale * (0.7 + 0.3 * k);
  rig.scale.setScalar(s);
  rig.position.set(anchor.x, anchor.y + (1 - k) * -4 + Math.sin(t * 1.1) * 0.08 * k * s - scroll * 0.6 * s, 0);
  const spin = (1 - k) * -Math.PI * 2.2;

  bottle.rotation.y = spin + Math.sin(t * 0.45) * 0.45 + pointer.sx * 0.9 + scroll * 2.2;
  bottle.rotation.x = pointer.sy * 0.3 + Math.sin(t * 0.7) * 0.04 + scroll * 0.2;
  bottle.rotation.z = Math.sin(t * 0.55) * 0.035 - pointer.sx * 0.08;

  // el líquido reacciona al giro como un resorte
  const vel = (bottle.rotation.y - prevRotY) / Math.max(dt, 1e-3); prevRotY = bottle.rotation.y;
  sloshV += (-slosh * 40 - sloshV * 4 + THREE.MathUtils.clamp(vel, -4, 4) * 0.9) * dt;
  slosh = THREE.MathUtils.clamp(slosh + sloshV * dt, -0.35, 0.35);

  rig.updateMatrixWorld(true);
  liquid.getWorldPosition(tmp);
  const level = tmp.y + LH * s * 0.12; // ~62% lleno
  up.set(Math.sin(slosh) * 0.6, -1, Math.sin(slosh * 0.7) * 0.4).normalize();
  surface.normal.copy(up);
  surface.constant = -up.dot(pt.set(tmp.x, level, tmp.z));

  // el menisco se apoya en el plano y queda recortado por el vidrio interno (aprox.: alineado al frasco)
  meniscus.position.copy(pt);
  meniscus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), up.clone().negate());
  meniscus.rotateZ(bottle.rotation.y);
  meniscus.scale.set((W - 0.34) * s, (D - 0.32) * s, 1);

  // atomizador presionado
  press = Math.max(press - dt * 5, 0);
  actuator.position.y = top + 0.56 - Math.sin(Math.min(press, 1) * Math.PI) * 0.08;

  // luz de barrido: hace correr los brillos por el vidrio
  sweep.position.set(anchor.x + Math.sin(t * 0.6) * 4, anchor.y + 1.5 + Math.cos(t * 0.4), 3.5);

  shadow.position.y = -H / 2 - 0.55 - Math.sin(t * 1.1) * 0.08 * k;
  shadow.material.opacity = 0.9 * k;
  glow2.material.opacity = 0.6 + Math.sin(t * 0.8) * 0.25;

  const p = dustGeo.attributes.position;
  for (let i = 0; i < N; i++) {
    let y = p.getY(i) + 0.004 + Math.sin(t + seed[i]) * 0.001;
    if (y > 4.6) y = -4.6;
    p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t * 0.5 + seed[i]) * 0.0015);
  }
  p.needsUpdate = true;
  dust.material.opacity = 0.3 + 0.5 * k;

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

// para la nube de perfume (main.js): dónde está la boquilla en pantalla
window.perfume3d = {
  nozzle() {
    nozzleTip.getWorldPosition(tmp).project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: r.left + (tmp.x + 1) / 2 * r.width, y: r.top + (1 - tmp.y) / 2 * r.height, s: rig.scale.x * 1.15 };
  },
  press() { press = 1; },
  ready() { return clock.getElapsedTime() > START + 2.4; },
};
