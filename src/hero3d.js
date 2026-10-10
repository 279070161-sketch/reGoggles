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

      // Align CAD coordinate orientation matching reference image (3/4 isometric perspective: visor front-left, headband loop top-right)
      rawModel.rotation.x = Math.PI * 0.38;
      rawModel.rotation.y = -Math.PI * 0.25;
      rawModel.rotation.z = -Math.PI * 0.15;

      modelGroup.add(rawModel);
      modelLoaded = true;

      // Base target rotation centered around reference pose
      targetRotationY = 0;
      targetRotationX = 0;
    },
    (progress) => {
      // Loading progress if needed
    },
    (error) => {
      console.error('Error loading reGoggles 3D model:', error);
    }
  );

  // Mouse interaction state variables
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0.12;
  let targetRotationY = 0.35;

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse move handler - Glasses look in the direction of the mouse
  function onMouseMove(event) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;

    if (!isDragging) {
      // Range: Yaw ±50deg (0.87 rad), Pitch ±30deg (0.52 rad)
      targetRotationY = mouseX * 0.87;
      targetRotationX = mouseY * 0.52;
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

      targetRotationY += deltaMove.x * 0.008;
      targetRotationX += deltaMove.y * 0.008;

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

      targetRotationY = mouseX * 0.85;
      targetRotationX = mouseY * 0.5;
    }
  }, { passive: true });

  // Smooth Render Loop (FPS-independent lerp + floating levitation)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (modelLoaded) {
      // Smooth interpolation towards mouse target rotation (spring dampening)
      modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.06;
      modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.06;

      // Continuous subtle mid-air levitation float effect
      modelGroup.position.y = Math.sin(elapsedTime * 1.8) * 14;
      modelGroup.rotation.z = Math.cos(elapsedTime * 1.2) * 0.02;
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
