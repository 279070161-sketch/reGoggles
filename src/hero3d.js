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
  canvas.style.height = '100%';
  canvas.style.maxHeight = 'clamp(650px, 85vh, 980px)';
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

      // Scale model to comfortably fill viewport (Enlarged scale from 460 to 580)
      const maxDim = Math.max(size.x, size.y, size.z);
      baseScale = 580 / maxDim;
      rawModel.scale.setScalar(baseScale);

      // Enhance material properties: Apply metallic for body frame, glass transparency for lenses
      rawModel.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.side = THREE.DoubleSide;

          const meshName = (child.name || '').toLowerCase();
          const matName = (child.material.name || '').toLowerCase();

          // Check if mesh or material represents the front protective lens / visor shield / transparent element
          const isLens = meshName.includes('lens') || 
                         meshName.includes('visor') || 
                         meshName.includes('glass') || 
                         meshName.includes('trans') || 
                         meshName.includes('shield') || 
                         meshName.includes('cover') || 
                         meshName.includes('window') || 
                         matName.includes('lens') || 
                         matName.includes('visor') || 
                         matName.includes('glass') || 
                         matName.includes('trans') || 
                         matName.includes('shield') || 
                         matName.includes('cover') || 
                         child.material.transparent === true ||
                         (child.material.opacity !== undefined && child.material.opacity < 0.98);

          if (isLens) {
            // Realistic crystal-clear transparent glass / acrylic visor rendering
            child.material.transparent = true;
            child.material.opacity = 0.28;       // Clear 72% transparent glass
            child.material.roughness = 0.05;     // Ultra-smooth glass reflection
            child.material.metalness = 0.02;     // Non-metallic glass
            child.material.depthWrite = false;   // Prevent z-buffer sorting artifacts for glass
            if (child.material.color) {
              child.material.color.setHex(0xd0e8ff); // Subtle crystalline light blue tint
            }
          } else {
            // Metallic industrial body frame
            if (child.material.metalness !== undefined) {
              child.material.metalness = 0.70;
              child.material.roughness = 0.28;
            }
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

  // Base Anchor Pose set by user: X=-1.91, Y=0.02, Z=-0.47
  let baseRotationX = -1.91;
  let baseRotationY = 0.02;
  let baseRotationZ = -0.47;

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
