import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initHero3D() {
  const container = document.getElementById('product-wrapper');
  if (!container) return;

  // Replace existing static image with canvas
  const existingImg = document.getElementById('product-img');
  if (existingImg) {
    existingImg.style.display = 'none';
  }

  // Canvas sizing and constraints
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-3d-canvas';
  canvas.style.width = '100%';
  canvas.style.height = 'clamp(620px, 82vh, 950px)';
  canvas.style.display = 'block';
  canvas.style.outline = 'none';
  canvas.style.cursor = 'grab';

  container.appendChild(canvas);

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = canvas.clientHeight || rect.height || 650;

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
  renderer.toneMappingExposure = 1.35;

  // Lighting setup - Fine-tuned industrial hardware illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.6);
  mainLight.position.set(300, 400, 500);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x447788, 1.5);
  fillLight.position.set(-400, -200, 300);
  scene.add(fillLight);

  const accentLimeLight = new THREE.DirectionalLight(0xc6e53d, 2.2);
  accentLimeLight.position.set(0, -300, -400);
  scene.add(accentLimeLight);

  const topRimLight = new THREE.DirectionalLight(0xffffff, 1.8);
  topRimLight.position.set(0, 500, -200);
  scene.add(topRimLight);

  // Group container for the 3D model
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  let modelLoaded = false;
  let baseScale = 1;

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
          matName.includes('silkscreen')
        ) {
          // Pre-tuned PBR: keep material as is, ensure correct rendering settings
          if (matName.includes('glass')) {
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
  };

  // Load 3D GLB Model (supports offline Base64 in memory or standard relative fetch)
  const loader = new GLTFLoader();
  const MODEL_URL = './reGoggles-render-hq.glb';

  if (typeof window !== 'undefined' && window.__REGOGGLES_MODEL_BASE64__) {
    try {
      const binaryString = atob(window.__REGOGGLES_MODEL_BASE64__);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      loader.parse(bytes.buffer, '', setupModel, (err) => {
        console.error('Error parsing embedded 3D model:', err);
      });
    } catch (e) {
      console.warn('Fallback to file loading:', e);
      loader.load(MODEL_URL, setupModel);
    }
  } else {
    loader.load(
      MODEL_URL,
      setupModel,
      (progress) => {},
      (error) => {
        console.error('Error loading reGoggles 3D model:', error);
      }
    );
  }

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

  // Base Anchor Translation to balance viewport (shifted left and down)
  const baseAnchorX = -65;
  const baseAnchorY = -42;

  // Smooth Render Loop (FPS-independent lerp + floating levitation + drag rotation)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

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
    const newHeight = canvas.clientHeight || newRect.height || 650;

    camera.aspect = newWidth / newHeight;
    camera.near = 5;
    camera.far = 5000;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight, false);
  }

  window.addEventListener('resize', onWindowResize);
}
