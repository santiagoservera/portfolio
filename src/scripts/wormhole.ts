/**
 * Wormhole — malla wireframe de un puente de Einstein-Rosen (superficie de revolución
 * r(z) = R0·cosh(z/k)), renderizada con WebGL puro.
 *
 * Por qué WebGL puro y no Three.js: la escena son líneas y puntos con un único shader.
 * Un motor completo agregaría ~150 KB gzip para algo que se resuelve en pocas líneas.
 *
 * - La cámara atraviesa la garganta a medida que se scrollea el hero.
 * - Se detiene cuando el hero sale de pantalla o la pestaña está oculta.
 * - Con prefers-reduced-motion se dibuja un solo cuadro estático.
 * - Si WebGL no está disponible, el hero conserva su fallback ASCII.
 */

type Mat4 = Float32Array;

const R0 = 1.15; // radio de la garganta
const K = 2.1; // apertura del embudo
const Z_EXT = 9.5; // largo de cada lado

const VERT = /* glsl */ `
attribute vec3 aData; // (theta, z, kind) kind: 0 anillo, 1 meridiano, 2 partícula
uniform mat4 uProj;
uniform mat4 uView;
uniform float uTime;
uniform float uSpin; // giro extra por gesto táctil (móvil)
uniform float uTap;  // segundos desde el último toque (móvil)
varying float vAlpha;
varying float vPulse;
varying float vKind;

// GLSL ES 1.0 no incluye cosh().
float coshf(float x) { return 0.5 * (exp(x) + exp(-x)); }

void main() {
  float kind = aData.z;
  float theta = aData.x;
  float z = aData.y;
  float rOff = 1.0;

  if (kind > 1.5) {
    // Partículas: viajan hacia la garganta y continúan del otro lado.
    float span = ${(Z_EXT * 2).toFixed(1)};
    z = ${Z_EXT.toFixed(1)} - mod(z + uTime * 1.1, span);
    rOff = 0.55 + fract(theta * 7.13) * 0.4;
  }

  float r = ${R0.toFixed(2)} * coshf(z / ${K.toFixed(2)}) * rOff;
  float a = theta + z * 0.16 + uTime * 0.05 + uSpin;
  vec3 p = vec3(cos(a) * r, sin(a) * r, z);

  vec4 mv = uView * vec4(p, 1.0);
  gl_Position = uProj * mv;

  float dist = -mv.z;
  float nearFade = smoothstep(0.4, 3.0, dist);
  float farFade = 1.0 - smoothstep(9.0, 22.0, dist);
  float throat = 1.0 - smoothstep(0.0, 6.0, abs(z));
  float flare = smoothstep(${(Z_EXT - 2.5).toFixed(1)}, ${Z_EXT.toFixed(1)}, abs(z));

  // Pulso de luz que recorre el túnel hacia adentro.
  float wave = fract(uTime * 0.075 - z * 0.055);
  vPulse = smoothstep(0.86, 1.0, wave) * (1.0 - smoothstep(0.985, 1.0, wave));

  // Toque: una onda de luz entra desde la boca del túnel hacia la garganta.
  float tapZ = 3.5 - uTap * 6.0;
  float tapBand = exp(-abs(z - tapZ) * 1.4) * (1.0 - smoothstep(0.2, 1.8, uTap));
  vPulse = max(vPulse, tapBand);

  vKind = kind;
  vAlpha = nearFade * farFade * (0.35 + throat * 0.65) * (1.0 - flare);
  gl_PointSize = kind > 1.5 ? clamp(5.5 / max(dist, 0.5), 1.0, 4.0) : 1.0;
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float uFade;
varying float vAlpha;
varying float vPulse;
varying float vKind;

const vec3 WINE = vec3(0.427, 0.129, 0.235);   // #6D213C
const vec3 WINE2 = vec3(0.545, 0.180, 0.290);  // #8B2E4A
const vec3 LIGHT = vec3(0.957, 0.957, 0.961);  // #F4F4F5

void main() {
  float base = vKind < 0.5 ? 0.55 : 0.32;
  vec3 col = mix(WINE, WINE2, vAlpha);
  col = mix(col, LIGHT, vPulse * 0.55);
  float a = vAlpha * (base + vPulse * 0.9);

  if (vKind > 1.5) {
    vec2 c = gl_PointCoord - 0.5;
    float d = 1.0 - smoothstep(0.1, 0.5, length(c));
    col = mix(WINE2, LIGHT, 0.45);
    a = vAlpha * d * 0.7;
  }

  gl_FragColor = vec4(col * a * uFade, a * uFade);
}
`;

function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye: number[], target: number[], up: number[]): Mat4 {
  let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
  let l = Math.hypot(zx, zy, zz) || 1;
  zx /= l; zy /= l; zz /= l;
  let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
  l = Math.hypot(xx, xy, xz) || 1;
  xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  // prettier-ignore
  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
}

function buildLines(rings: number, segs: number, meridians: number, steps: number): Float32Array {
  const out: number[] = [];
  const TAU = Math.PI * 2;
  // Anillos: distribuidos con sinh para concentrarlos cerca de la garganta.
  for (let i = 0; i < rings; i++) {
    const u = (i / (rings - 1)) * 2 - 1;
    const z = (Math.sinh(u * 2.2) / Math.sinh(2.2)) * Z_EXT;
    for (let s = 0; s < segs; s++) {
      out.push((s / segs) * TAU, z, 0, ((s + 1) / segs) * TAU, z, 0);
    }
  }
  // Meridianos.
  for (let m = 0; m < meridians; m++) {
    const t = (m / meridians) * TAU;
    for (let s = 0; s < steps; s++) {
      const z0 = -Z_EXT + (s / steps) * Z_EXT * 2;
      const z1 = -Z_EXT + ((s + 1) / steps) * Z_EXT * 2;
      out.push(t, z0, 1, t, z1, 1);
    }
  }
  return new Float32Array(out);
}

function buildParticles(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = Math.random() * Math.PI * 2;
    out[i * 3 + 1] = Math.random() * Z_EXT * 2;
    out[i * 3 + 2] = 2;
  }
  return out;
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('No se pudo crear el shader');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader: ${log}`);
  }
  return sh;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export interface WormholeOptions {
  canvas: HTMLCanvasElement;
  /** Elemento cuyo scroll controla el viaje de la cámara (el hero). */
  track: HTMLElement;
  reducedMotion: boolean;
  /**
   * Modo móvil: composición vertical (portal arriba, centrado en el eje),
   * giro con swipe horizontal, pulso de luz con un toque y viaje controlado por getProgress.
   */
  mobile?: boolean;
  /** Progreso 0 → 1 del viaje. Si no se pasa, se calcula con la salida del hero de pantalla. */
  getProgress?: () => number;
  /** Elemento que recibe los gestos táctiles en modo móvil. */
  touchTarget?: HTMLElement;
  /** Se llama la primera vez que la persona interactúa con el túnel (para ocultar la pista). */
  onInteract?: () => void;
  onReady?: () => void;
  onFail?: () => void;
}

export async function mountWormhole({
  canvas,
  track,
  reducedMotion,
  mobile = false,
  getProgress,
  touchTarget,
  onInteract,
  onReady,
  onFail,
}: WormholeOptions): Promise<() => void> {
  // El arranque se reparte en pasos cortos (cediendo el hilo entre uno y otro) para no
  // bloquear la página: crear el contexto, compilar shaders y subir la geometría.
  const yieldTask = () => new Promise<void>((r) => setTimeout(r, 0));
  // En celular sin antialias: el contexto es más barato y en pantallas densas no se nota.
  const gl = canvas.getContext('webgl', { antialias: !mobile, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) {
    onFail?.();
    return () => {};
  }

  // Sin aceleración por hardware (renderizado por software) el túnel se vería entrecortado
  // y bloquearía el hilo principal: en ese caso se queda el fallback ASCII.
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    onFail?.();
    return () => {};
  }

  await yieldTask();

  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
  } catch (err) {
    console.warn('[wormhole] WebGL no disponible:', err);
    onFail?.();
    return () => {};
  }

  await yieldTask();

  // En móvil: menos geometría y una malla más limpia (se lee mejor en pantallas chicas).
  const lines = mobile ? buildLines(34, 72, 24, 64) : buildLines(64, 112, 44, 96);
  const particles = buildParticles(mobile ? 180 : 520);

  const lineBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
  gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
  const partBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, partBuf);
  gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);

  gl.useProgram(program);
  const aData = gl.getAttribLocation(program, 'aData');
  const uProj = gl.getUniformLocation(program, 'uProj');
  const uView = gl.getUniformLocation(program, 'uView');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uSpin = gl.getUniformLocation(program, 'uSpin');
  const uTap = gl.getUniformLocation(program, 'uTap');
  const uFade = gl.getUniformLocation(program, 'uFade');

  await yieldTask();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // aditivo: las líneas suman luz
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  let width = 0;
  let height = 0;
  let raf = 0;
  let running = false;
  let visible = true;
  let progress = 0;
  let smoothProgress = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const start = performance.now();

  // Estado táctil (móvil)
  let spin = 0;
  let spinVel = 0;
  let tapAt = -99;
  let interacted = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    if (!mobile) {
      gl!.uniformMatrix4fv(uProj, false, perspective(58 * (Math.PI / 180), width / Math.max(height, 1), 0.05, 60));
    }
  }

  function measureScroll() {
    if (getProgress) {
      progress = clamp01(getProgress());
      return;
    }
    const rect = track.getBoundingClientRect();
    progress = clamp01(-rect.top / Math.max(rect.height, 1));
  }

  function drawDesktop(time: number, p: number) {
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const camZ = 7.2 - p * 9.5; // de afuera del embudo hasta atravesar la garganta
    const drift = reducedMotion ? 0 : Math.sin(time * 0.15) * 0.25;
    const eye = [0.9 + pointer.sx * 0.6 + drift, 0.55 - pointer.sy * 0.4, camZ];
    const target = [pointer.sx * 0.3, pointer.sy * 0.2, camZ - 8];
    gl!.uniformMatrix4fv(uView, false, lookAt(eye, target, [0, 1, 0]));
    // Se apaga antes de que el contenido de la siguiente sección llegue al centro.
    gl!.uniform1f(uFade, 1 - smooth(0.15, 0.7, p));
  }

  function drawMobile(time: number, p: number) {
    // Inercia del giro táctil.
    spin += spinVel;
    spinVel *= 0.93;

    // Cámara sobre el eje: el portal se ve como un círculo limpio.
    // Termina justo al cruzar la garganta: pasado ese punto las paredes se abren fuera de cuadro.
    const camZ = 6.2 - p * 4.2;
    const sway = reducedMotion ? 0 : Math.sin(time * 0.4) * 0.06;
    gl!.uniformMatrix4fv(uView, false, lookAt([sway, 0, camZ], [0, 0, camZ - 8], [0, 1, 0]));

    // Lens shift: el portal arranca en la mitad superior y se centra al bucear.
    const proj = perspective(64 * (Math.PI / 180), width / Math.max(height, 1), 0.05, 60);
    proj[9] = -0.36 * (1 - smooth(0, 0.55, p));
    gl!.uniformMatrix4fv(uProj, false, proj);

    gl!.uniform1f(uSpin, spin);
    gl!.uniform1f(uTap, (performance.now() - tapAt) / 1000);
    // Se atenúa al final pero no desaparece: el anillo se va con el scroll al soltar la pantalla.
    gl!.uniform1f(uFade, 1 - smooth(0.6, 1, p) * 0.25);
  }

  function draw(time: number) {
    measureScroll();
    smoothProgress += (progress - smoothProgress) * (reducedMotion ? 1 : mobile ? 0.14 : 0.08);
    const p = smoothProgress;

    gl!.uniform1f(uTime, time);
    if (mobile) drawMobile(time, p);
    else {
      gl!.uniform1f(uSpin, 0);
      gl!.uniform1f(uTap, 99);
      drawDesktop(time, p);
    }

    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.enableVertexAttribArray(aData);

    gl!.bindBuffer(gl!.ARRAY_BUFFER, lineBuf);
    gl!.vertexAttribPointer(aData, 3, gl!.FLOAT, false, 0, 0);
    gl!.drawArrays(gl!.LINES, 0, lines.length / 3);

    gl!.bindBuffer(gl!.ARRAY_BUFFER, partBuf);
    gl!.vertexAttribPointer(aData, 3, gl!.FLOAT, false, 0, 0);
    gl!.drawArrays(gl!.POINTS, 0, particles.length / 3);
  }

  function loop(now: number) {
    if (!running) return;
    draw((now - start) / 1000);
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const markInteracted = () => {
    if (interacted) return;
    interacted = true;
    onInteract?.();
  };

  /* ---------- Gestos táctiles (solo móvil) ---------- */
  // touch-action: pan-y en el target → el scroll vertical sigue siendo del navegador;
  // los arrastres horizontales llegan como pointermove y giran el túnel.
  let gesture: { id: number; x: number; y: number; lastX: number; t: number; moved: boolean } | null = null;

  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a, button')) return;
    gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, t: performance.now(), moved: false };
  };
  const onMove = (e: PointerEvent) => {
    if (!gesture || e.pointerId !== gesture.id) return;
    const dx = e.clientX - gesture.lastX;
    gesture.lastX = e.clientX;
    if (Math.abs(e.clientX - gesture.x) > 8 || Math.abs(e.clientY - gesture.y) > 8) gesture.moved = true;
    spinVel = Math.max(Math.min(spinVel + dx * 0.0022, 0.18), -0.18);
    if (gesture.moved) markInteracted();
  };
  const onUp = (e: PointerEvent) => {
    if (!gesture || e.pointerId !== gesture.id) return;
    const quick = performance.now() - gesture.t < 350;
    if (!gesture.moved && quick) {
      tapAt = performance.now();
      markInteracted();
      if (reducedMotion) draw(4);
    }
    gesture = null;
  };
  const onCancel = () => (gesture = null);

  const onResize = () => {
    resize();
    if (reducedMotion) draw(4);
  };
  const onScroll = () => {
    if (reducedMotion) {
      measureScroll();
      return;
    }
  };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onVisibility = () => (document.hidden ? pause() : play());
  const onLost = (e: Event) => {
    e.preventDefault();
    pause();
    onFail?.();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      canvas.style.visibility = visible ? 'visible' : 'hidden';
      visible ? play() : pause();
    },
    { threshold: 0 },
  );

  resize();
  measureScroll();
  smoothProgress = progress;
  draw(reducedMotion ? 4 : 0);
  onReady?.();

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  if (!mobile) window.addEventListener('pointermove', onPointer, { passive: true });
  if (mobile && touchTarget && !reducedMotion) {
    touchTarget.addEventListener('pointerdown', onDown, { passive: true });
    touchTarget.addEventListener('pointermove', onMove, { passive: true });
    touchTarget.addEventListener('pointerup', onUp, { passive: true });
    touchTarget.addEventListener('pointercancel', onCancel, { passive: true });
  }
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);
  io.observe(track);
  play();

  return () => {
    pause();
    io.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onPointer);
    touchTarget?.removeEventListener('pointerdown', onDown);
    touchTarget?.removeEventListener('pointermove', onMove);
    touchTarget?.removeEventListener('pointerup', onUp);
    touchTarget?.removeEventListener('pointercancel', onCancel);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
  };
}

