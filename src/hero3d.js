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

  // Create canvas element for Three.js
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-3d-canvas';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.maxHeight = ' clamp(550px, 78vh, 880px)';
  canvas.style.display = 'block';
  canvas.style.outline = 'none';
  canvas.style.cursor = 'grab';

  container.appendChild(canvas);

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const rect = container.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const height = rect.height || 600;

  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
  camera.position.set(0, 0, 850);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
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
  const loader = new GLTFLoader();
  loader.load(
    './reGoggles-3D-1008.glb',
    (gltf) => {
      const rawModel = gltf.scene;

      // Calculate Bounding Box and Center Model
      const box = new THREE.Box3().setFromObject(rawModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      rawModel.position.sub(center);

      // Scale model to comfortably fill viewport
      const maxDim = Math.max(size.x, size.y, size.z);
      baseScale = 460 / maxDim;
      rawModel.scale.setScalar(baseScale);

      // Enhance material properties for realistic metallic and frosted rendering
      rawModel.traverse((child) => {
        if (child.isMesh) {
          child.material.side = THREE.DoubleSide;
          if (child.material.metalness !== undefined) {
            child.material.metalness = 0.75;
            child.material.roughness = 0.25;
          }
        }
      });

      // Keep rawModel local rotation at 0, 0, 0
      rawModel.rotation.set(0, 0, 0);

      modelGroup.add(rawModel);
      modelLoaded = true;
    },
    (progress) => {},
    (error) => {
      console.error('Error loading reGoggles 3D model:', error);
    }
  );

  // Reference Image Anchor Pose: 1.1右侧仰视视角
  // Outer front lens facing front-left & upwards to camera, headband arch top-right, battery module bottom-right
  const BASE_ROTATION_X = -0.35; // Low-angle pitch up view
  const BASE_ROTATION_Y = 0.70;  // Yaw front lens towards front-left
  const BASE_ROTATION_Z = -0.20; // Roll slant for 3/4 perspective view

  // Mouse interaction state variables (relative offset delta)
  let mouseX = 0;
  let mouseY = 0;
  let targetDeltaY = 0;
  let targetDeltaX = 0;

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse move handler - Subtle cursor tracking relative to anchor pose
  function onMouseMove(event) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;

    if (!isDragging) {
      // Relative mouse interaction range: Yaw ±12deg (0.21 rad), Pitch ±8deg (0.14 rad)
      targetDeltaY = mouseX * 0.21;
      targetDeltaX = mouseY * 0.14;
    }
  }

  // Drag orbit support
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    canvas.style.cursor = 'grabbing';
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging && modelLoaded) {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      targetDeltaY += deltaMove.x * 0.008;
      targetDeltaX += deltaMove.y * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Touch support for mobile devices
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      mouseX = (touch.clientX - windowHalfX) / windowHalfX;
      mouseY = (touch.clientY - windowHalfY) / windowHalfY;

      targetDeltaY = mouseX * 0.20;
      targetDeltaX = mouseY * 0.12;
    }
  }, { passive: true });

  // Smooth Render Loop (FPS-independent lerp + floating levitation around reference anchor pose)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (modelLoaded) {
      // Target rotation is BASE ANCHOR POSE + MOUSE RELATIVE DELTA
      const targetY = BASE_ROTATION_Y + targetDeltaY;
      const targetX = BASE_ROTATION_X + targetDeltaX;

      // Smooth spring dampening towards target rotation
      modelGroup.rotation.y += (targetY - modelGroup.rotation.y) * 0.06;
      modelGroup.rotation.x += (targetX - modelGroup.rotation.x) * 0.06;

      // Z roll includes base rotation + subtle floating oscillation
      modelGroup.rotation.z = BASE_ROTATION_Z + Math.cos(elapsedTime * 1.2) * 0.015;

      // Continuous subtle mid-air levitation float effect
      modelGroup.position.y = Math.sin(elapsedTime * 1.8) * 12;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  function onWindowResize() {
    const newRect = container.getBoundingClientRect();
    const newWidth = newRect.width || window.innerWidth;
    const newHeight = newRect.height || 600;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight, false);
  }

  window.addEventListener('resize', onWindowResize);
}
