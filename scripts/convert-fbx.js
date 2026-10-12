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

console.log('2. Defining authentic KeyShot PBR materials...');

const materials = {
  strap_lime: new THREE.MeshStandardMaterial({
    name: 'strap_lime',
    color: new THREE.Color(0x7ca818), // Deep saturated woven nylon lime (does not wash out white under light)
    roughness: 0.82,
    metalness: 0.0,
    side: THREE.DoubleSide
  }),
  glass_visor: new THREE.MeshPhysicalMaterial({
    name: 'glass_visor',
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.12,
    transmission: 0.96,
    roughness: 0.02,
    ior: 1.52,
    reflectivity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  frame_translucent: new THREE.MeshPhysicalMaterial({
    name: 'frame_translucent',
    color: new THREE.Color(0x2c343b), // Semi-transparent smoked polycarbonate front frame
    transparent: true,
    opacity: 0.38,
    transmission: 0.74,
    roughness: 0.14,
    ior: 1.52,
    reflectivity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  housing_grey: new THREE.MeshStandardMaterial({
    name: 'housing_grey',
    color: new THREE.Color(0x3e454c), // Matte anodized slate grey
    metalness: 0.40,
    roughness: 0.38,
    side: THREE.DoubleSide
  }),
  sensor_dark: new THREE.MeshStandardMaterial({
    name: 'sensor_dark',
    color: new THREE.Color(0x181a1c), // Dark graphite for ToF sensor & camera trims
    metalness: 0.60,
    roughness: 0.28,
    side: THREE.DoubleSide
  }),
  lime_accents: new THREE.MeshStandardMaterial({
    name: 'lime_accents',
    color: new THREE.Color(0x96d61e), // Signature lime green accents
    metalness: 0.15,
    roughness: 0.30,
    side: THREE.DoubleSide
  }),
  polished_metals: new THREE.MeshStandardMaterial({
    name: 'polished_metals',
    color: new THREE.Color(0xdce3ed), // Polished nickel and aluminum hardware
    metalness: 0.90,
    roughness: 0.16,
    side: THREE.DoubleSide
  }),
  silkscreen_lime: new THREE.MeshStandardMaterial({
    name: 'silkscreen_lime',
    color: new THREE.Color(0xaee824), // Vibrant lime green silkscreen (seeed studio on temple, crosshairs, stripes)
    metalness: 0.15,
    roughness: 0.25,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
    depthTest: true,
    depthWrite: true
  }),
  silkscreen_white: new THREE.MeshStandardMaterial({
    name: 'silkscreen_white',
    color: new THREE.Color(0xf6f9fc), // Crisp white silkscreen (FC, CE certifications on glass)
    metalness: 0.10,
    roughness: 0.25,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
    depthTest: true,
    depthWrite: true
  }),
  silkscreen_dark: new THREE.MeshStandardMaterial({
    name: 'silkscreen_dark',
    color: new THREE.Color(0x1f2226),
    metalness: 0.20,
    roughness: 0.30,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -4,
    depthTest: true,
    depthWrite: true
  })
};

console.log('3. Grouping sub-meshes by KeyShot material and unifying transforms...');
rawScene.updateMatrixWorld(true);

const groups = {
  strap_lime: [],
  glass_visor: [],
  frame_translucent: [],
  housing_grey: [],
  sensor_dark: [],
  lime_accents: [],
  polished_metals: [],
  silkscreen_lime: [],
  silkscreen_white: [],
  silkscreen_dark: []
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
    const colHex = origMat?.color ? origMat.color.getHexString() : '';

    // Exact categorization matching KeyShot industrial render
    let category = 'housing_grey';
    if (meshName.includes('头顶绑带') || meshName.includes('绑带') || meshName.includes('strap')) {
      category = 'strap_lime';
    } else if (meshName.includes('丝印') || matName.includes('1906')) {
      if (colHex === 'cccccc' || matName.includes('1906')) {
        category = 'silkscreen_white';
      } else if (colHex === '84a32f' || matName.includes('1929')) {
        category = 'silkscreen_lime'; // Temple seeed studio, crosshair logo, etc.
      } else {
        category = 'silkscreen_dark';
      }
    } else if (meshName.includes('镜片') && matName.includes('glass')) {
      category = 'glass_visor'; // Clear front visor lens
    } else if (matName.includes('glass') || matName.includes('115') || matName.includes('113')) {
      category = 'frame_translucent'; // Front frame & temple transparent covers
    } else if (
      matName.includes('1929') || 
      matName.includes('1832') || 
      matName.includes('1911') || 
      matName.includes('1882') || 
      matName.includes('1974') || 
      (origMat?.color && origMat.color.g > origMat.color.r * 1.1 && origMat.color.g > 0.22)
    ) {
      category = 'lime_accents';
    } else if (
      matName.includes('nickel') || 
      matName.includes('aluminum') || 
      matName.includes('niobium') || 
      meshName.includes('元器件')
    ) {
      category = 'polished_metals';
    } else if (matName.includes('1930') || matName.includes('1938') || matName.includes('1939')) {
      category = 'housing_grey';
    } else {
      category = 'sensor_dark';
    }

    // Merge duplicate vertices to index the geometry
    const mergedGeom = BufferGeometryUtils.mergeVertices(child.geometry, 0.001);
    mergedGeom.applyMatrix4(child.matrixWorld);

    // If silkscreen, offset along normal by 0.08mm to physically separate from coplanar body
    if (category.startsWith('silkscreen')) {
      mergedGeom.computeVertexNormals();
      const posAttr = mergedGeom.attributes.position;
      const normAttr = mergedGeom.attributes.normal;
      if (posAttr && normAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          posAttr.setXYZ(
            i,
            posAttr.getX(i) + normAttr.getX(i) * 0.08,
            posAttr.getY(i) + normAttr.getY(i) * 0.08,
            posAttr.getZ(i) + normAttr.getZ(i) * 0.08
          );
        }
        posAttr.needsUpdate = true;
      }
    }

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
    mesh.renderOrder = category.startsWith('silkscreen') ? 2 : (category === 'glass_visor' || category === 'frame_translucent') ? 3 : 1;
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
