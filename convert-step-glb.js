import fs from 'fs';
import occtimportjs from 'occt-import-js';

async function convertToGLB() {
  console.log('Initializing OpenCASCADE WASM...');
  const occt = await occtimportjs();

  console.log('Reading STEP file reGoggles 3D-1008.stp...');
  const fileBuffer = fs.readFileSync('f:/projects/reGoggles/reGoggles 3D-1008.stp');
  
  console.log('Parsing STEP geometry...');
  const result = occt.ReadStepFile(fileBuffer, null);

  if (!result || !result.success || !result.meshes.length) {
    console.error('Failed to parse STEP file');
    process.exit(1);
  }

  console.log(`Parsed ${result.meshes.length} sub-meshes from STEP file.`);

  // Aesthetic color palette matching industrial AI glasses (titanium grey, matte black, lime accent, glass transparent)
  const palette = [
    { color: [0.11, 0.17, 0.18], metallic: 0.75, roughness: 0.25, opacity: 1.0, transparent: false }, // 0: Dark titanium
    { color: [0.18, 0.24, 0.26], metallic: 0.75, roughness: 0.25, opacity: 1.0, transparent: false }, // 1: Matte slate grey
    { color: [0.78, 0.90, 0.24], metallic: 0.50, roughness: 0.35, opacity: 1.0, transparent: false }, // 2: Lime accent
    { color: [0.82, 0.92, 1.00], metallic: 0.05, roughness: 0.05, opacity: 0.25, transparent: true },  // 3: GLASS LENS (Transparent)
    { color: [0.24, 0.31, 0.32], metallic: 0.75, roughness: 0.25, opacity: 1.0, transparent: false }, // 4: Anodized frame
    { color: [0.07, 0.11, 0.12], metallic: 0.80, roughness: 0.20, opacity: 1.0, transparent: false }  // 5: Core black housing
  ];

  const bufferChunks = [];
  let currentByteOffset = 0;

  const accessors = [];
  const bufferViews = [];
  const meshes = [];
  const nodes = [];
  const materials = [];

  // Create palette materials
  palette.forEach((mat, idx) => {
    const pbr = {
      baseColorFactor: [mat.color[0], mat.color[1], mat.color[2], mat.opacity],
      metallicFactor: mat.metallic,
      roughnessFactor: mat.roughness
    };

    const matObj = {
      name: mat.transparent ? `glass_lens_material` : `material_${idx}`,
      pbrMetallicRoughness: pbr
    };

    if (mat.transparent) {
      matObj.alphaMode = "BLEND";
    }

    materials.push(matObj);
  });

  result.meshes.forEach((meshData, idx) => {
    const posArray = new Float32Array(meshData.attributes.position.array);
    const posBuffer = Buffer.from(posArray.buffer, posArray.byteOffset, posArray.byteLength);
    
    // Position BufferView & Accessor
    let minPos = [Infinity, Infinity, Infinity];
    let maxPos = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < posArray.length; i += 3) {
      minPos[0] = Math.min(minPos[0], posArray[i]);
      minPos[1] = Math.min(minPos[1], posArray[i + 1]);
      minPos[2] = Math.min(minPos[2], posArray[i + 2]);
      maxPos[0] = Math.max(maxPos[0], posArray[i]);
      maxPos[1] = Math.max(maxPos[1], posArray[i + 1]);
      maxPos[2] = Math.max(maxPos[2], posArray[i + 2]);
    }

    const posBufferViewIndex = bufferViews.length;
    bufferViews.push({
      buffer: 0,
      byteOffset: currentByteOffset,
      byteLength: posBuffer.byteLength,
      target: 34962 // ARRAY_BUFFER
    });
    bufferChunks.push(posBuffer);
    currentByteOffset += posBuffer.byteLength;

    const posAccessorIndex = accessors.length;
    accessors.push({
      bufferView: posBufferViewIndex,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: posArray.length / 3,
      type: "VEC3",
      min: minPos,
      max: maxPos
    });

    const attributes = { POSITION: posAccessorIndex };

    // Normal Attribute
    if (meshData.attributes.normal) {
      const normArray = new Float32Array(meshData.attributes.normal.array);
      const normBuffer = Buffer.from(normArray.buffer, normArray.byteOffset, normArray.byteLength);

      const normBufferViewIndex = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: normBuffer.byteLength,
        target: 34962
      });
      bufferChunks.push(normBuffer);
      currentByteOffset += normBuffer.byteLength;

      const normAccessorIndex = accessors.length;
      accessors.push({
        bufferView: normBufferViewIndex,
        byteOffset: 0,
        componentType: 5126,
        count: normArray.length / 3,
        type: "VEC3"
      });

      attributes.NORMAL = normAccessorIndex;
    }

    // Index Attribute
    let indexAccessorIndex = null;
    if (meshData.index) {
      const idxArray = new Uint32Array(meshData.index.array);
      const idxBuffer = Buffer.from(idxArray.buffer, idxArray.byteOffset, idxArray.byteLength);

      const idxBufferViewIndex = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: currentByteOffset,
        byteLength: idxBuffer.byteLength,
        target: 34963 // ELEMENT_ARRAY_BUFFER
      });
      bufferChunks.push(idxBuffer);
      currentByteOffset += idxBuffer.byteLength;

      indexAccessorIndex = accessors.length;
      accessors.push({
        bufferView: idxBufferViewIndex,
        byteOffset: 0,
        componentType: 5125, // UNSIGNED_INT
        count: idxArray.length,
        type: "SCALAR"
      });
    }

    const dx = maxPos[0] - minPos[0];
    const dy = maxPos[1] - minPos[1];
    const dz = maxPos[2] - minPos[2];

    // Detect front visor outer lens (dx > 140, dy > 35) or inner eye lenses (dx > 50, dy > 75)
    const isLensMesh = (dx > 140 && dy > 35 && dz < 25) || (dx > 50 && dy > 75 && dz < 25);
    const matIdx = isLensMesh ? 3 : (idx % materials.length === 3 ? 0 : idx % materials.length);

    const primitive = {
      attributes: attributes,
      material: matIdx
    };
    if (indexAccessorIndex !== null) {
      primitive.indices = indexAccessorIndex;
    }

    const meshIndex = meshes.length;
    meshes.push({
      name: meshData.name || `part_${idx}`,
      primitives: [primitive]
    });

    nodes.push({
      name: meshData.name || `part_${idx}`,
      mesh: meshIndex
    });
  });

  const sceneNodeIndices = nodes.map((_, i) => i);

  const gltfJson = {
    asset: { version: "2.0", generator: "reGoggles-cad-converter" },
    scene: 0,
    scenes: [{ nodes: sceneNodeIndices }],
    nodes: nodes,
    meshes: meshes,
    materials: materials,
    accessors: accessors,
    bufferViews: bufferViews,
    buffers: [{ byteLength: currentByteOffset }]
  };

  let jsonString = JSON.stringify(gltfJson);
  while (Buffer.byteLength(jsonString, 'utf8') % 4 !== 0) {
    jsonString += ' ';
  }
  const jsonBuffer = Buffer.from(jsonString, 'utf8');

  let binBuffer = Buffer.concat(bufferChunks);
  while (binBuffer.byteLength % 4 !== 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.from([0])]);
  }

  const totalLength = 12 + 8 + jsonBuffer.byteLength + 8 + binBuffer.byteLength;

  const headerBuffer = Buffer.alloc(12);
  headerBuffer.writeUInt32LE(0x46546C67, 0); // "glTF"
  headerBuffer.writeUInt32LE(2, 4);          // version
  headerBuffer.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBuffer.byteLength, 0);
  jsonHeader.writeUInt32LE(0x4E4F534A, 4);   // "JSON"

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binBuffer.byteLength, 0);
  binHeader.writeUInt32LE(0x004E4942, 4);    // "BIN\0"

  const finalGlbBuffer = Buffer.concat([
    headerBuffer,
    jsonHeader,
    jsonBuffer,
    binHeader,
    binBuffer
  ]);

  if (!fs.existsSync('f:/projects/reGoggles/public')) {
    fs.mkdirSync('f:/projects/reGoggles/public', { recursive: true });
  }

  fs.writeFileSync('f:/projects/reGoggles/public/reGoggles-3D-1008.glb', finalGlbBuffer);
  console.log(`SUCCESS! Generated f:/projects/reGoggles/public/reGoggles-3D-1008.glb (${finalGlbBuffer.length} bytes)`);
}

convertToGLB().catch(err => {
  console.error('Conversion error:', err);
  process.exit(1);
});
