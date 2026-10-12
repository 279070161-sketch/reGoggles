import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const ROOT = 'f:/projects/reGoggles';
const DIST = path.join(ROOT, 'dist');
const ASSETS_OUT = path.join(DIST, 'assets');

console.log('=== Building Standalone 100% Offline Double-Clickable Package ===');

// Clean dist folder
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(ASSETS_OUT, { recursive: true });

// 1. Bundle JS with esbuild into IIFE format
console.log('1. Bundling JavaScript into standalone IIFE app.bundle.js...');
esbuild.buildSync({
  entryPoints: [path.join(ROOT, 'src/main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  outfile: path.join(ASSETS_OUT, 'app.bundle.js'),
  platform: 'browser',
  target: ['es2020', 'chrome80', 'edge80', 'safari14']
});

// 2. Encode 3D GLB Model into model-data.js as Base64 for zero-CORS in-memory parsing
console.log('2. Generating model-data.js for in-memory 3D rendering (zero CORS)...');
const glbBuffer = fs.readFileSync(path.join(ROOT, 'public/reGoggles-3D-1008.glb'));
const base64Str = glbBuffer.toString('base64');
const modelJsContent = `window.__REGOGGLES_MODEL_BASE64__ = "${base64Str}";\n`;
fs.writeFileSync(path.join(ASSETS_OUT, 'model-data.js'), modelJsContent, 'utf8');

// 3. Minify and copy CSS
console.log('3. Bundling style.css...');
const cssContent = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const minifiedCss = esbuild.transformSync(cssContent, { loader: 'css', minify: true });
fs.writeFileSync(path.join(ASSETS_OUT, 'style.css'), minifiedCss.code, 'utf8');

// 4. Copy static web assets (images, videos) into dist/assets
console.log('4. Copying images and videos into dist/assets...');
function copyRecursive(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, item.name);
    const d = path.join(dst, item.name);
    if (item.isDirectory()) {
      copyRecursive(s, d);
    } else if (item.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

copyRecursive(path.join(ROOT, 'assets/images'), path.join(ASSETS_OUT, 'images'));
copyRecursive(path.join(ROOT, 'assets/videos'), path.join(ASSETS_OUT, 'videos'));

// Also copy favicon/logo and glb as backup
if (fs.existsSync(path.join(ROOT, 'public/logo.svg'))) {
  fs.copyFileSync(path.join(ROOT, 'public/logo.svg'), path.join(DIST, 'logo.svg'));
}
if (fs.existsSync(path.join(ROOT, 'public/reGoggles-3D-1008.glb'))) {
  fs.copyFileSync(path.join(ROOT, 'public/reGoggles-3D-1008.glb'), path.join(DIST, 'reGoggles-3D-1008.glb'));
}

// 5. Generate clean standalone dist/index.html
console.log('5. Generating dist/index.html with classic zero-CORS scripts...');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Replace CSS link to point to ./assets/style.css
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="\.\/src\/style\.css"\s*\/?>/i,
  '<link rel="stylesheet" href="./assets/style.css" />'
);

// Remove ES module script and importmap
html = html.replace(/<script\s+type="importmap">[\s\S]*?<\/script>/i, '');
html = html.replace(/<script\s+type="module"\s+src="\.\/src\/main\.js"><\/script>/i, '');

// Append classic offline scripts before </body>
const scriptTags = `
  <!-- Standalone Zero-Server Offline 3D Engine & Model -->
  <script src="./assets/model-data.js"></script>
  <script src="./assets/app.bundle.js"></script>
</body>`;

html = html.replace('</body>', scriptTags);

fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

console.log('=== Standalone Offline Package Built Successfully in dist/ ===');
