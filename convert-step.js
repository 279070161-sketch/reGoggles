import fs from 'fs';
import occtimportjs from 'occt-import-js';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Polyfill FileReader for GLTFExporter in Node environment
if (typeof global.FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        if (this.onload) {
          this.result = buf;
          this.onload({ target: this });
        }
      }).catch(err => {
        if (this.onerror) this.onerror(err);
      });
    }
  };
}

async function convert() {
  console.log('Initializing OpenCASCADE WASM...');
  const occt = await occtimportjs();

  console.log('Reading STEP file reGoggles 3D-1008.stp...');
  const fileBuffer = fs.readFileSync('f:/projects/reGoggles/reGoggles 3D-1008.stp');
  
  console.log('Parsing STEP geometry...');
  const result = occt.ReadStepFile(fileBuffer, null);

  if (!result || !result.success) {
    console.error('Failed to parse STEP file');
    process.exit(1);
  }

  console.log(`Parsed ${result.meshes.length} sub-meshes from STEP file.`);

  const scene = new THREE.Scene();

  // Fine-tuned aesthetic color palette for industrial AI glasses hardware
  const palette = [
    0x1c2b2d, 0x2d3e42, 0xc6e53d, 0x738789, 0x3d4f52, 0x566a6d, 0x111c1e
  ];

  result.meshes.forEach((meshData, idx) => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(meshData.attributes.position.array);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    if (meshData.attributes.normal) {
      const normals = new Float32Array(meshData.attributes.normal.array);
      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    } else {
      geometry.computeVertexNormals();
    }

    if (meshData.index) {
      const indices = new Uint32Array(meshData.index.array);
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    }

    let colorVal = palette[idx % palette.length];
    if (meshData.color) {
      colorVal = new THREE.Color(meshData.color[0], meshData.color[1], meshData.color[2]);
    }

    const material = new THREE.MeshStandardMaterial({
      color: colorVal,
      metalness: 0.7,
      roughness: 0.3,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = meshData.name || `mesh_${idx}`;
    scene.add(mesh);
  });

  // Ensure public directory exists
  if (!fs.existsSync('f:/projects/reGoggles/public')) {
    fs.mkdirSync('f:/projects/reGoggles/public', { recursive: true });
  }

  console.log('Exporting scene to GLTF JSON format...');
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const output = JSON.stringify(gltf, null, 2);
      fs.writeFileSync('f:/projects/reGoggles/public/reGoggles-3D-1008.gltf', output);
      console.log('SUCCESS: Exported f:/projects/reGoggles/public/reGoggles-3D-1008.gltf (size:', output.length, 'bytes)');
      process.exit(0);
    },
    (error) => {
      console.error('Export error:', error);
      process.exit(1);
    },
    { embedImages: true, binary: false }
  );
}

convert().catch(err => {
  console.error('Error during conversion:', err);
  process.exit(1);
});
