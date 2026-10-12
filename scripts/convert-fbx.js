import fs from 'fs';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Polyfills for Node.js
if (typeof global.FileReader === 'undefined') {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }).catch(err => {
        if (this.onerror) this.onerror(err);
      });
    }
    readAsDataURL(blob) {
      blob.arrayBuffer().then(buf => {
        this.result = `data:application/octet-stream;base64,${Buffer.from(buf).toString('base64')}`;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }).catch(err => {
        if (this.onerror) this.onerror(err);
      });
    }
  };
}
if (typeof global.document === 'undefined') {
  global.document = {
    createElementNS: () => ({ style: {}, addEventListener: () => {} }),
    createElement: () => ({ style: {}, addEventListener: () => {} })
  };
}
if (typeof global.window === 'undefined') global.window = { innerWidth: 1920, innerHeight: 1080 };

const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

console.log('1. Reading and parsing FBX file: reGoggles-渲染源文件.fbx...');
const fbxBuffer = fs.readFileSync('reGoggles-渲染源文件.fbx');
const loader = new FBXLoader();
const rawScene = loader.parse(fbxBuffer.buffer.slice(fbxBuffer.byteOffset, fbxBuffer.byteOffset + fbxBuffer.byteLength), '');

console.log('2. Defining premium PBR materials...');

const materials = {
  glass: new THREE.MeshPhysicalMaterial({
    name: 'glass_lens',
    color: new THREE.Color(0x18242e),
    transparent: true,
    opacity: 0.22,
    roughness: 0.04,
    metalness: 0.05,
    transmission: 0.90,
    ior: 1.52,
    reflectivity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  lime: new THREE.MeshStandardMaterial({
    name: 'lime_accent',
    color: new THREE.Color(0x8cb330),
    metalness: 0.20,
    roughness: 0.35,
    side: THREE.DoubleSide
  }),
  metal: new THREE.MeshStandardMaterial({
    name: 'polished_metal',
    color: new THREE.Color(0xdce2ec),
    metalness: 0.88,
    roughness: 0.18,
    side: THREE.DoubleSide
  }),
  silkscreen: new THREE.MeshStandardMaterial({
    name: 'silkscreen_white',
    color: new THREE.Color(0xedf2f7),
    metalness: 0.15,
    roughness: 0.30,
    side: THREE.DoubleSide
  }),
  housing: new THREE.MeshStandardMaterial({
    name: 'matte_housing',
    color: new THREE.Color(0x181c20),
    metalness: 0.65,
    roughness: 0.28,
    side: THREE.DoubleSide
  })
};

console.log('3. Grouping sub-meshes by material and unifying transforms...');
rawScene.updateMatrixWorld(true);

const groups = {
  glass: [],
  lime: [],
  metal: [],
  silkscreen: [],
  housing: []
};

let totalInputMeshes = 0;
let totalInputVertices = 0;

rawScene.traverse(child => {
  if (child.isMesh && child.geometry) {
    totalInputMeshes++;
    const pos = child.geometry.attributes.position;
    if (pos) totalInputVertices += pos.count;

    const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
    const matName = (origMat?.name || '').toLowerCase();
    const meshName = (child.name || '').toLowerCase();

    // Determine category
    let category = 'housing';
    if (matName.includes('glass') || meshName.includes('镜片')) {
      category = 'glass';
    } else if (
      matName.includes('aluminum') ||
      matName.includes('nickel') ||
      matName.includes('niobium') ||
      matName.includes('metal')
    ) {
      category = 'metal';
    } else if (
      (origMat?.color && origMat.color.g > origMat.color.r * 1.05 && origMat.color.g > 0.22) ||
      matName.includes('1929') ||
      matName.includes('1911') ||
      matName.includes('1882') ||
      matName.includes('1832')
    ) {
      category = 'lime';
    } else if (matName.includes('1906') || meshName.includes('丝印') || matName.includes('white')) {
      category = 'silkscreen';
    } else {
      category = 'housing';
    }

    // Merge duplicate vertices to index the geometry
    const mergedGeom = BufferGeometryUtils.mergeVertices(child.geometry, 0.001);
    mergedGeom.applyMatrix4(child.matrixWorld);
    groups[category].push(mergedGeom);
  }
});

console.log(`Original: ${totalInputMeshes} meshes, ${totalInputVertices} vertices.`);

console.log('4. Merging geometries into consolidated PBR group nodes...');
const exportScene = new THREE.Scene();

for (const [category, geoms] of Object.entries(groups)) {
  if (geoms.length === 0) continue;
  console.log(`- Merging ${geoms.length} geometries for '${category}'...`);
  const merged = BufferGeometryUtils.mergeGeometries(geoms, false);
  if (merged) {
    // Recalculate vertex normals for seamless smooth shading
    merged.computeVertexNormals();
    const mesh = new THREE.Mesh(merged, materials[category]);
    mesh.name = `reGoggles_${category}`;
    exportScene.add(mesh);
  }
}

// Center the scene at origin
const box = new THREE.Box3().setFromObject(exportScene);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
console.log('Consolidated Bounding Box:');
console.log(`Size: X=${size.x.toFixed(2)}, Y=${size.y.toFixed(2)}, Z=${size.z.toFixed(2)}`);
console.log(`Center: X=${center.x.toFixed(2)}, Y=${center.y.toFixed(2)}, Z=${center.z.toFixed(2)}`);

// Shift exportScene so center is exactly (0,0,0)
exportScene.position.sub(center);

console.log('5. Exporting optimized model to binary GLB...');
const exporter = new GLTFExporter();
const glbArrayBuffer = await exporter.parseAsync(exportScene, { binary: true });
const outBuffer = Buffer.from(glbArrayBuffer);

const outputPath = 'public/reGoggles-render-hq.glb';
fs.writeFileSync(outputPath, outBuffer);
console.log(`SUCCESS! Generated ${outputPath} (${(outBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
console.log('Export scene child count:', exportScene.children.length);
