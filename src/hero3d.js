import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function initHero3D() {
  const container = document.getElementById('product-wrapper');
  if (!container) return;

  // Full-Screen Digital Preloader Controller
  const preloaderEl = document.getElementById('global-preloader');
  const percentEl = document.getElementById('preloader-percent');

  let currentDisplayPct = 0;
  let targetPct = 12;
  let preloaderDismissed = false;

  function updatePreloaderTarget(pct) {
    if (pct > targetPct) targetPct = Math.min(100, Math.floor(pct));
  }

  // Smooth digital counter loop: constantly ticks and smoothly chases targetPct
  const progressTimer = setInterval(() => {
    if (preloaderDismissed) {
      clearInterval(progressTimer);
      return;
    }
    // Steadily advance targetPct up to 86% while waiting for network / decoder
    if (targetPct < 86) {
      targetPct += 0.45;
    }
    if (currentDisplayPct < targetPct) {
      const diff = targetPct - currentDisplayPct;
      const step = Math.min(4, Math.max(1, Math.ceil(diff * 0.16)));
      currentDisplayPct = Math.min(targetPct, currentDisplayPct + step);
      if (percentEl) percentEl.textContent = Math.floor(currentDisplayPct);
    }
  }, 32);

  function finishPreloader() {
    if (preloaderDismissed) return;
    targetPct = 100;

    const check100 = setInterval(() => {
      if (currentDisplayPct >= 100) {
        clearInterval(check100);
        clearInterval(progressTimer);
        preloaderDismissed = true;
        setTimeout(() => {
          if (preloaderEl) {
            preloaderEl.classList.add('loaded');
            setTimeout(() => {
              try { preloaderEl.remove(); } catch (e) {}
            }, 550);
          }
        }, 120);
      } else {
        currentDisplayPct = Math.min(100, currentDisplayPct + 3);
        if (percentEl) percentEl.textContent = Math.floor(currentDisplayPct);
      }
    }, 20);
  }

  // Safety timer to prevent getting stuck if any asset fails
  setTimeout(() => {
    finishPreloader();
  }, 7000);

  // Remove legacy static image if still present
  const existingImg = document.getElementById('product-img');
  if (existingImg) {
    existingImg.remove();
  }

  // Defer all heavy WebGL init to next event-loop tick so the preloader
  // setInterval renders at least one frame before the GPU/main-thread work begins.
  setTimeout(() => {

  // Canvas sizing and constraints (Full-bleed 100% viewport width & height)
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-3d-canvas';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.outline = 'none';
  canvas.style.cursor = 'grab';

  container.appendChild(canvas);

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup - Full viewport aspect ratio prevents clipping at any angle
  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || window.innerHeight;

  // near: 5, far: 5000 - Completely prevents clipping at any 360 degree rotation angle
  const camera = new THREE.PerspectiveCamera(35, width / height, 5, 5000);
  camera.position.set(0, 0, 850);

  // Renderer setup with logarithmic depth buffer to permanently eliminate Z-fighting on silkscreen
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05; // Controlled exposure to preserve saturated lime green

  // Setup High-End Studio HDRI Environment for realistic KeyShot reflections
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  scene.environmentIntensity = 0.75; // Balanced environment reflection without blinding specular glaze

  // Lighting setup - Soft, controlled KeyShot studio illumination (no overexposure)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(400, 500, 600);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0xcce2ec, 0.85);
  fillLight.position.set(-500, -100, 400);
  scene.add(fillLight);

  const limeRimLight = new THREE.DirectionalLight(0x92c81a, 0.8);
  limeRimLight.position.set(200, -300, -400);
  scene.add(limeRimLight);

  const topRimLight = new THREE.DirectionalLight(0xffffff, 0.9);
  topRimLight.position.set(0, 600, -300);
  scene.add(topRimLight);

  // Group container for the 3D model
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  let modelLoaded = false;
  let baseScale = 1;

  // Procedural woven nylon strap textures (interlaced ballistic nylon webbing)
  // Uses 256×256 (4× less pixels than 512) to avoid blocking the main thread during preloader.
  // Pre-cached sin/cos lookup tables further reduce per-pixel cost.
  let wovenTextures = null;
  function getWovenStrapTextures() {
    if (wovenTextures) return wovenTextures;

    const size = 256;
    const numCells = 16;

    // Pre-compute sin/cos lookup tables — avoids repeated trig calls inside the pixel loop
    const sinTable = new Float32Array(size);
    const cosTable = new Float32Array(size);
    const sin4Table = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const f = (i / size) * numCells % 1; // fractional position within cell
      sinTable[i] = Math.sin(f * Math.PI);
      cosTable[i] = Math.cos(f * Math.PI);
      sin4Table[i] = Math.sin(f * Math.PI * 4);
    }

    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = size;
    colorCanvas.height = size;
    const colorCtx = colorCanvas.getContext('2d');
    const colorImg = colorCtx.createImageData(size, size);
    const colorData = colorImg.data;

    const normalCanvas = document.createElement('canvas');
    normalCanvas.width = size;
    normalCanvas.height = size;
    const normalCtx = normalCanvas.getContext('2d');
    const normalImg = normalCtx.createImageData(size, size);
    const normalData = normalImg.data;

    // Cache cell parity per row/col
    const cellX = new Int32Array(size);
    const cellY = new Int32Array(size);
    for (let i = 0; i < size; i++) {
      cellX[i] = Math.floor((i / size) * numCells);
      cellY[i] = Math.floor((i / size) * numCells);
    }

    function getHeight(x, y) {
      const cx = cellX[x], cy = cellY[y];
      const isWarp = (cx + cy) % 2 === 0;
      let h;
      if (isWarp) {
        const dome = sinTable[x];
        h = Math.pow(Math.max(0, dome), 0.72) * 0.88 + cosTable[y] * 0.16 + sin4Table[x] * 0.04;
      } else {
        const dome = sinTable[y];
        h = Math.pow(Math.max(0, dome), 0.72) * 0.88 - cosTable[x] * 0.16 + sin4Table[y] * 0.04;
      }
      return h < 0 ? 0 : h > 1 ? 1 : h;
    }

    // Authentic woven lime green: #7ca818 -> R: 124, G: 168, B: 24
    const baseR = 124, baseG = 168, baseB = 24;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const h = getHeight(x, y);

        const shade = 0.72 + h * 0.38;
        colorData[idx]     = Math.min(255, baseR * shade + 0.5 | 0);
        colorData[idx + 1] = Math.min(255, baseG * shade + 0.5 | 0);
        colorData[idx + 2] = Math.min(255, baseB * shade + 0.5 | 0);
        colorData[idx + 3] = 255;

        // Tangent-space Normal (sample 4 neighbors)
        const x0 = (x - 1 + size) & (size - 1);
        const x1 = (x + 1) & (size - 1);
        const y0 = (y - 1 + size) & (size - 1);
        const y1 = (y + 1) & (size - 1);

        const dx = (getHeight(x1, y) - getHeight(x0, y)) * 3.5;
        const dy = (getHeight(x, y1) - getHeight(x, y0)) * 3.5;
        const invLen = 1.0 / Math.sqrt(dx * dx + dy * dy + 1.0);

        normalData[idx]     = (-dx * invLen * 0.5 + 0.5) * 255 + 0.5 | 0;
        normalData[idx + 1] = (-dy * invLen * 0.5 + 0.5) * 255 + 0.5 | 0;
        normalData[idx + 2] = (invLen * 0.5 + 0.5) * 255 + 0.5 | 0;
        normalData[idx + 3] = 255;
      }
    }

    colorCtx.putImageData(colorImg, 0, 0);
    normalCtx.putImageData(normalImg, 0, 0);

    const colorTexture = new THREE.CanvasTexture(colorCanvas);
    colorTexture.wrapS = THREE.RepeatWrapping;
    colorTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.repeat.set(80, 24);
    colorTexture.colorSpace = THREE.SRGBColorSpace;
    colorTexture.generateMipmaps = true;

    const normalTexture = new THREE.CanvasTexture(normalCanvas);
    normalTexture.wrapS = THREE.RepeatWrapping;
    normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(80, 24);
    normalTexture.generateMipmaps = true;

    wovenTextures = { colorTexture, normalTexture };
    return wovenTextures;
  }

  // Load 3D GLB Model
  // Model setup handler
  const setupModel = (gltf) => {
    const rawModel = gltf.scene;

    // Calculate Bounding Box and Center Model
    const box = new THREE.Box3().setFromObject(rawModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    rawModel.position.sub(center);

    // Scale model to comfortably fill hero section
    const maxDim = Math.max(size.x, size.y, size.z);
    baseScale = 680 / maxDim;
    rawModel.scale.setScalar(baseScale);

    // Enhance material properties
    let meshIndex = 0;
    rawModel.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const meshName = (child.name || '').toLowerCase();
        const matName = (child.material && child.material.name ? child.material.name : '').toLowerCase();

        // If mesh already has pre-tuned PBR materials (from optimized FBX converter)
        if (
          matName.includes('glass') || 
          matName.includes('lime') || 
          matName.includes('metal') || 
          matName.includes('housing') ||
          matName.includes('silkscreen') ||
          matName.includes('sensor') ||
          matName.includes('translucent') ||
          matName.includes('strap')
        ) {
          // Pre-tuned PBR: keep material as is, ensure correct rendering settings
          if (matName.includes('glass') || matName.includes('translucent')) {
            child.material.transparent = true;
            child.material.depthWrite = false;
            child.renderOrder = 3;
          } else if (matName.includes('silkscreen')) {
            child.material.transparent = false;
            child.material.depthWrite = true;
            child.material.polygonOffset = true;
            child.material.polygonOffsetFactor = -2;
            child.material.polygonOffsetUnits = -4;
            child.renderOrder = 2;
          } else if (matName.includes('strap') || meshName.includes('strap')) {
            // Authentic woven nylon webbing with tactile woven micro-relief
            const { colorTexture, normalTexture } = getWovenStrapTextures();
            child.material = new THREE.MeshStandardMaterial({
              name: 'strap_lime_woven',
              map: colorTexture,
              normalMap: normalTexture,
              normalScale: new THREE.Vector2(2.0, 2.0),
              roughness: 0.84,
              metalness: 0.02,
              side: THREE.DoubleSide
            });
            child.renderOrder = 1;
          } else {
            child.material.transparent = false;
            child.material.depthWrite = true;
            child.renderOrder = 1;
          }
          child.material.side = THREE.DoubleSide;
        } else {
          // Legacy CAD model compatibility
          const isFrontLens = meshName.includes('269') || 
                              meshName.includes('part_269') || 
                              matName.includes('glass') || 
                              meshIndex === 269;

          if (isFrontLens) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xdbf0ff,
              transparent: true,
              opacity: 0.18,
              roughness: 0.03,
              metalness: 0.0,
              transmission: 0.92,
              ior: 1.5,
              reflectivity: 0.6,
              side: THREE.DoubleSide,
              depthWrite: false
            });
          } else if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.depthWrite = true;
            if (child.material.metalness !== undefined) {
              child.material.metalness = 0.70;
              child.material.roughness = 0.28;
            }
          }
        }
        meshIndex++;
      }
    });

    // Keep rawModel local rotation at 0, 0, 0
    rawModel.rotation.set(0, 0, 0);

    modelGroup.add(rawModel);
    modelLoaded = true;

    // Trigger immediate render of first 3D frame before unveiling
    renderer.render(scene, camera);
    finishPreloader();
  };

  // Load 3D GLB Model with Draco compression support
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();

  // Compute absolute base URL from page location.
  // This is critical for esbuild IIFE builds where import.meta.url is undefined,
  // causing DRACOLoader's internal URL resolver to silently produce wrong paths.
  const _pageBase = (() => {
    const loc = window.location;
    // Strip filename from pathname if present (pages served as index.html have trailing /)
    const dir = loc.pathname.endsWith('/') ? loc.pathname : loc.pathname.replace(/\/[^/]*$/, '/');
    return loc.origin + dir;
  })();

  // Pass decoder paths as an explicit object — avoids all import.meta.url / resolveURL issues
  dracoLoader.setDecoderPath({
    js:   _pageBase + 'draco/gltf/draco_wasm_wrapper.js',
    wasm: _pageBase + 'draco/gltf/draco_decoder.wasm'
  });
  loader.setDRACOLoader(dracoLoader);

  const MODEL_URL = _pageBase + 'reGoggles-render-hq.glb';

  updatePreloaderTarget(18);

  loader.load(
    MODEL_URL,
    setupModel,
    (progress) => {
      if (progress.total > 0) {
        const pct = Math.min(94, Math.floor((progress.loaded / progress.total) * 94));
        updatePreloaderTarget(pct);
      } else if (progress.loaded > 0) {
        // Fallback for servers without Content-Length header (assume ~5.6MB model)
        const estTotal = 5865000;
        const pct = Math.min(94, Math.floor((progress.loaded / estTotal) * 94));
        updatePreloaderTarget(pct);
      }
    },
    (error) => {
      console.error('Error loading reGoggles 3D model:', error);
      finishPreloader();
    }
  );

  // Base Anchor Pose for Y-up HQ model:
  // Tilted down (X=0.28) and turned ~33 deg towards 3/4 isometric view (Y=-0.58)
  let baseRotationX = 0.28;
  let baseRotationY = -0.58;
  let baseRotationZ = -0.06;

  // Mouse interaction & drag orbit state
  let mouseX = 0;
  let mouseY = 0;
  let targetDeltaY = 0;
  let targetDeltaX = 0;

  let isDragging = false;
  let dragDeltaX = 0;
  let dragDeltaY = 0;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse hover tracking
  function onMouseMove(event) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;

    if (!isDragging) {
      targetDeltaY = mouseX * 0.18;
      targetDeltaX = mouseY * 0.12;
    }
  }

  // Mouse Drag Orbit Event Listeners
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    canvas.style.cursor = 'grabbing';
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      canvas.style.cursor = 'grab';
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging && modelLoaded) {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      dragDeltaY += deltaMove.x * 0.008;
      dragDeltaX += deltaMove.y * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Touch Drag Orbit for Mobile Devices
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1 && modelLoaded) {
      const touch = e.touches[0];
      const deltaMove = {
        x: touch.clientX - previousMousePosition.x,
        y: touch.clientY - previousMousePosition.y
      };

      dragDeltaY += deltaMove.x * 0.008;
      dragDeltaX += deltaMove.y * 0.008;

      previousMousePosition = { x: touch.clientX, y: touch.clientY };
    }
  }, { passive: true });

  // Base Anchor Translation to balance viewport (shifted slightly right and down per user request)
  const baseAnchorX = -105;
  const baseAnchorY = -108;

  // Off-screen render pause to save GPU when scrolled away
  let isHeroVisible = true;
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const heroSection = document.getElementById('hero') || container;
    const heroObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);
  }

  // Smooth Render Loop (FPS-independent lerp + floating levitation + drag rotation)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isHeroVisible) return; // Pause GPU rendering when hero is not visible

    const elapsedTime = clock.getElapsedTime();

    if (modelLoaded) {
      // Target rotation is BASE ANCHOR POSE + DRAG ROTATION + MOUSE RELATIVE DELTA
      const targetY = baseRotationY + dragDeltaY + targetDeltaY;
      const targetX = baseRotationX + dragDeltaX + targetDeltaX;

      // Smooth spring dampening towards target rotation
      modelGroup.rotation.y += (targetY - modelGroup.rotation.y) * 0.08;
      modelGroup.rotation.x += (targetX - modelGroup.rotation.x) * 0.08;

      // Z roll includes base rotation + subtle floating oscillation
      modelGroup.rotation.z = baseRotationZ + Math.cos(elapsedTime * 1.2) * 0.015;

      // Continuous subtle mid-air levitation float effect with left-down anchor offset
      modelGroup.position.x = baseAnchorX;
      modelGroup.position.y = baseAnchorY + Math.sin(elapsedTime * 1.8) * 12;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  function onWindowResize() {
    const newRect = container.getBoundingClientRect();
    const newWidth = newRect.width || window.innerWidth;
    const newHeight = newRect.height || window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.near = 5;
    camera.far = 5000;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight, false);
  }

  window.addEventListener('resize', onWindowResize);

  }, 0); // end setTimeout — deferred 3D init
}
