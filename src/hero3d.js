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
  let currentBaseX = -0.35; // Low-angle pitch up view
  let currentBaseY = 0.70;  // Yaw front lens towards front-left
  let currentBaseZ = -0.20; // Roll slant for 3/4 perspective view

  // Mouse interaction state variables (relative offset delta)
  let mouseX = 0;
  let mouseY = 0;
  let targetDeltaY = 0;
  let targetDeltaX = 0;

  let isDragging = false;
  let isRightDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Create UI Control & Real-time Readout Panel
  const panel = document.createElement('div');
  panel.id = 'hero-3d-debug-panel';
  panel.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    background: rgba(12, 16, 20, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(198, 229, 61, 0.35);
    border-radius: 12px;
    padding: 16px 18px;
    color: #e2e8f0;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 13px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    width: 280px;
    user-select: none;
  `;

  panel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
      <span style="font-weight: 700; color: #c6e53d; display: flex; align-items: center; gap: 6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        3D 角度实时调试板
      </span>
      <span style="font-size: 10px; opacity: 0.6; background: rgba(198,229,61,0.15); color: #c6e53d; padding: 2px 6px; border-radius: 4px;">按住拖拽眼镜</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>X 轴 俯仰 (Pitch):</span>
          <strong id="val-rot-x" style="color: #c6e53d; font-family: monospace;">-0.35</strong>
        </div>
        <input type="range" id="slider-rot-x" min="-3.14" max="3.14" step="0.01" value="-0.35" style="width: 100%; accent-color: #c6e53d; cursor: pointer;">
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Y 轴 偏航 (Yaw):</span>
          <strong id="val-rot-y" style="color: #c6e53d; font-family: monospace;">0.70</strong>
        </div>
        <input type="range" id="slider-rot-y" min="-3.14" max="3.14" step="0.01" value="0.70" style="width: 100%; accent-color: #c6e53d; cursor: pointer;">
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Z 轴 翻滚 (Roll):</span>
          <strong id="val-rot-z" style="color: #c6e53d; font-family: monospace;">-0.20</strong>
        </div>
        <input type="range" id="slider-rot-z" min="-3.14" max="3.14" step="0.01" value="-0.20" style="width: 100%; accent-color: #c6e53d; cursor: pointer;">
      </div>

      <button id="btn-copy-angles" style="
        margin-top: 6px;
        background: #c6e53d;
        color: #0b0f12;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        复制当前角度数值
      </button>
    </div>
  `;

  container.style.position = 'relative';
  container.appendChild(panel);

  const sliderX = panel.querySelector('#slider-rot-x');
  const sliderY = panel.querySelector('#slider-rot-y');
  const sliderZ = panel.querySelector('#slider-rot-z');
  const valX = panel.querySelector('#val-rot-x');
  const valY = panel.querySelector('#val-rot-y');
  const valZ = panel.querySelector('#val-rot-z');
  const btnCopy = panel.querySelector('#btn-copy-angles');

  function updatePanelUI() {
    sliderX.value = currentBaseX.toFixed(2);
    sliderY.value = currentBaseY.toFixed(2);
    sliderZ.value = currentBaseZ.toFixed(2);

    valX.textContent = currentBaseX.toFixed(2);
    valY.textContent = currentBaseY.toFixed(2);
    valZ.textContent = currentBaseZ.toFixed(2);
  }

  sliderX.addEventListener('input', (e) => {
    currentBaseX = parseFloat(e.target.value);
    valX.textContent = currentBaseX.toFixed(2);
  });

  sliderY.addEventListener('input', (e) => {
    currentBaseY = parseFloat(e.target.value);
    valY.textContent = currentBaseY.toFixed(2);
  });

  sliderZ.addEventListener('input', (e) => {
    currentBaseZ = parseFloat(e.target.value);
    valZ.textContent = currentBaseZ.toFixed(2);
  });

  btnCopy.addEventListener('click', () => {
    const textToCopy = `BASE_ROTATION_X = ${currentBaseX.toFixed(2)};\nBASE_ROTATION_Y = ${currentBaseY.toFixed(2)};\nBASE_ROTATION_Z = ${currentBaseZ.toFixed(2)};`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      btnCopy.style.background = '#22c55e';
      btnCopy.style.color = '#ffffff';
      btnCopy.innerHTML = '✓ 已复制数值!';
      setTimeout(() => {
        btnCopy.style.background = '#c6e53d';
        btnCopy.style.color = '#0b0f12';
        btnCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> 复制当前角度数值`;
      }, 2000);
    });
  });

  // Mouse move handler - Subtle cursor tracking relative to anchor pose
  function onMouseMove(event) {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;

    if (!isDragging && !isRightDragging) {
      // Relative mouse interaction range: Yaw ±12deg (0.21 rad), Pitch ±8deg (0.14 rad)
      targetDeltaY = mouseX * 0.15;
      targetDeltaX = mouseY * 0.10;
    }
  }

  // Prevent context menu on right drag
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Drag orbit support (Left-drag for Pitch/Yaw, Right-drag for Roll)
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
    } else if (e.button === 2) {
      isRightDragging = true;
    }
    canvas.style.cursor = 'grabbing';
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    isRightDragging = false;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mousemove', (e) => {
    if ((isDragging || isRightDragging) && modelLoaded) {
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      if (isDragging) {
        currentBaseY += deltaMove.x * 0.008;
        currentBaseX += deltaMove.y * 0.008;
      } else if (isRightDragging) {
        currentBaseZ += deltaMove.x * 0.008;
      }

      updatePanelUI();
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

      targetDeltaY = mouseX * 0.15;
      targetDeltaX = mouseY * 0.10;
    }
  }, { passive: true });

  // Smooth Render Loop (FPS-independent lerp + floating levitation around reference anchor pose)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (modelLoaded) {
      // Target rotation is BASE ANCHOR POSE + MOUSE RELATIVE DELTA
      const targetY = currentBaseY + targetDeltaY;
      const targetX = currentBaseX + targetDeltaX;

      // Smooth spring dampening towards target rotation
      modelGroup.rotation.y += (targetY - modelGroup.rotation.y) * 0.08;
      modelGroup.rotation.x += (targetX - modelGroup.rotation.x) * 0.08;

      // Z roll includes base rotation + subtle floating oscillation
      modelGroup.rotation.z = currentBaseZ + Math.cos(elapsedTime * 1.2) * 0.015;

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
