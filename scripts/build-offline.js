import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ASSETS_OUT = path.join(DIST, 'assets');

console.log('=== Building Standalone 100% Offline Double-Clickable Package ===');

// Clean dist folder
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(ASSETS_OUT, { recursive: true });

// ------------------------------------------------------------------
// Fix for "preloader stuck at 0% on GitHub Pages":
// esbuild IIFE builds replace `import.meta` with an empty object, so any
// bundled module that runs `new URL(x, import.meta.url)` at module scope
// (three.js DRACOLoader does exactly this) throws
//   "Uncaught TypeError: Failed to construct 'URL': Invalid URL"
// the moment the bundle is evaluated. The whole app then never registers
// its listeners and the preloader stays at 0% forever.
// This plugin rewrites import.meta.url to resolve against the page URL,
// which is a valid absolute base in every environment (GitHub Pages,
// any static host, and file://).
// ------------------------------------------------------------------
const importMetaUrlShim = {
  name: 'import-meta-url-shim',
  setup(build) {
    build.onLoad({ filter: /\.m?js$/ }, (args) => {
      let contents = fs.readFileSync(args.path, 'utf8');
      if (!contents.includes('import.meta.url')) return null;
      contents = contents.replace(
        /import\.meta\.url/g,
        '(typeof self !== "undefined" && self.location ? self.location.href : "")'
      );
      return { contents, loader: 'js' };
    });
  },
};

// 1. Bundle JS with esbuild into IIFE format
console.log('1. Bundling JavaScript into standalone IIFE app.bundle.js...');
await esbuild.build({
  entryPoints: [path.join(ROOT, 'src/main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  outfile: path.join(ASSETS_OUT, 'app.bundle.js'),
  platform: 'browser',
  target: ['es2022'],
  plugins: [importMetaUrlShim]
});

// 2. Minify and copy CSS
console.log('2. Bundling style.css...');
const cssContent = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const minifiedCss = esbuild.transformSync(cssContent, { loader: 'css', minify: true });
fs.writeFileSync(path.join(ASSETS_OUT, 'style.css'), minifiedCss.code, 'utf8');

// 3. Copy static web assets (images, videos) into dist/assets
console.log('3. Copying images and videos into dist/assets...');
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

// Copy favicon/logo, 3D model, and Draco decoders
if (fs.existsSync(path.join(ROOT, 'public/logo.svg'))) {
  fs.copyFileSync(path.join(ROOT, 'public/logo.svg'), path.join(DIST, 'logo.svg'));
}
if (fs.existsSync(path.join(ROOT, 'public/reGoggles-render-hq.glb'))) {
  fs.copyFileSync(path.join(ROOT, 'public/reGoggles-render-hq.glb'), path.join(DIST, 'reGoggles-render-hq.glb'));
}
if (fs.existsSync(path.join(ROOT, 'public/calibrate.html'))) {
  fs.copyFileSync(path.join(ROOT, 'public/calibrate.html'), path.join(DIST, 'calibrate.html'));
}
if (fs.existsSync(path.join(ROOT, 'public/draco'))) {
  copyRecursive(path.join(ROOT, 'public/draco'), path.join(DIST, 'draco'));
  copyRecursive(path.join(ROOT, 'public/draco'), path.join(ASSETS_OUT, 'draco'));
}

// 4. Generate clean standalone dist/index.html
console.log('4. Generating dist/index.html with fast production bundle...');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Replace CSS link to point to ./assets/style.css
html = html.replace(
  /<link\s+rel="stylesheet"\s+href="\.\/src\/style\.css"\s*\/?>/i,
  '<link rel="stylesheet" href="./assets/style.css" />'
);

// Remove ES module script and importmap
html = html.replace(/<script\s+type="importmap">[\s\S]*?<\/script>/i, '');
html = html.replace(/<script\s+type="module"\s+src="\.\/src\/main\.js"><\/script>/i, '');

// Append standalone bundle before </body>
const scriptTags = `
  <!-- Preloader watchdog: if the main bundle ever crashes at evaluation
       time, the counter would stay at 0% forever and soft-lock the site.
       If nothing has advanced the counter after 6 seconds, take over,
       animate to 100% and remove the preloader. -->
  <script>
    (function () {
      setTimeout(function () {
        var el = document.getElementById('preloader-percent');
        if (!el || el.textContent !== '0') return; // real app already running
        var p = document.getElementById('global-preloader');
        var n = 0;
        var iv = setInterval(function () {
          n += 3;
          el.textContent = Math.min(100, n);
          if (n >= 100) {
            clearInterval(iv);
            if (p) {
              p.classList.add('loaded');
              setTimeout(function () { try { p.remove(); } catch (e) {} }, 600);
            }
          }
        }, 60);
      }, 6000);
    })();
  </script>

  <!-- Standalone High-Performance 3D Engine Bundle -->
  <script src="./assets/app.bundle.js"></script>
</body>`;

html = html.replace('</body>', scriptTags);

fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');

console.log('=== Standalone Offline Package Built Successfully in dist/ ===');
