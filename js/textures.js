// ============================================================================
// COSMOS 3D - HYBRID TEXTURE & HIGH-RES PROCEDURAL SURFACE ENGINE
// ============================================================================
// Combines real internet planetary imagery (NASA / Wikimedia / Three.js)
// with multi-octave procedural maps & high-frequency detail bump maps so
// approaching any planet reveals progressively sharper craters, clouds & relief.

class TextureEngine {
    constructor(renderer) {
        this.renderer = renderer;
        this.loader = new THREE.TextureLoader();
        this.loader.setCrossOrigin('anonymous');
        this.cache = new Map();
        this.maxAnisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
        this.sharedDetailBump = null;
    }

    // Fast deterministic value noise + FBM for planetary terrains
    hash(x, y, seed = 1) {
        let n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
        return n - Math.floor(n);
    }

    noise2D(x, y, seed = 1) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        const ux = fx * fx * (3.0 - 2.0 * fx);
        const uy = fy * fy * (3.0 - 2.0 * fy);

        const a = this.hash(ix, iy, seed);
        const b = this.hash(ix + 1, iy, seed);
        const c = this.hash(ix, iy + 1, seed);
        const d = this.hash(ix + 1, iy + 1, seed);

        return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }

    fbm(x, y, octaves = 5, seed = 1) {
        let value = 0.0;
        let amp = 0.5;
        let freq = 1.0;
        for (let i = 0; i < octaves; i++) {
            value += amp * this.noise2D(x * freq, y * freq, seed + i * 13);
            freq *= 2.05;
            amp *= 0.5;
        }
        return value;
    }

    configureTexture(tex, repeatX = 1, repeatY = 1) {
        tex.anisotropy = this.maxAnisotropy;
        if (repeatX > 1 || repeatY > 1) {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeatX, repeatY);
        } else {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
        }
        tex.needsUpdate = true;
        return tex;
    }

    // High-frequency tiled micro-bump texture used when approaching planets closely (LOD sharpening)
    getHighFreqDetailBump() {
        if (this.sharedDetailBump) return this.sharedDetailBump;

        const w = 512, h = 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(w, h);
        const data = img.data;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                // Tileable coordinates using sin/cos mapping
                const nx = Math.cos((x / w) * Math.PI * 2) * 4 + Math.sin((x / w) * Math.PI * 2) * 4;
                const ny = Math.cos((y / h) * Math.PI * 2) * 4 + Math.sin((y / h) * Math.PI * 2) * 4;
                const n = this.fbm(nx + x * 0.06, ny + y * 0.06, 5, 99);
                const ridge = Math.abs(n - 0.5) * 2.0;
                const val = Math.min(255, Math.max(0, Math.floor((n * 0.7 + (1.0 - ridge) * 0.3) * 255)));
                const idx = (y * w + x) * 4;
                data[idx] = val;
                data[idx + 1] = val;
                data[idx + 2] = val;
                data[idx + 3] = 255;
            }
        }

        // Stamp micro-craters for close-up inspection
        ctx.putImageData(img, 0, 0);
        for (let i = 0; i < 90; i++) {
            const cx = Math.random() * w;
            const cy = Math.random() * h;
            const r = 3 + Math.random() * 18;
            const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
            grad.addColorStop(0, 'rgba(30, 30, 30, 0.55)');
            grad.addColorStop(0.75, 'rgba(240, 240, 240, 0.55)');
            grad.addColorStop(1, 'rgba(128, 128, 128, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        this.configureTexture(tex, 6, 3);
        this.sharedDetailBump = tex;
        return tex;
    }

    // Generate high-res procedural planetary map (1024x512) + bump map
    generatePlanetTextures(type = 'earth', seedStr = 'sol') {
        const cacheKey = `proc_${type}_${seedStr}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        let seed = 1;
        for (let i = 0; i < seedStr.length; i++) {
            seed = (seed * 31 + seedStr.charCodeAt(i)) % 10000;
        }

        const w = 1024, h = 512;
        const colorCanvas = document.createElement('canvas');
        colorCanvas.width = w;
        colorCanvas.height = h;
        const ctx = colorCanvas.getContext('2d');

        const bumpCanvas = document.createElement('canvas');
        bumpCanvas.width = w;
        bumpCanvas.height = h;
        const bCtx = bumpCanvas.getContext('2d');

        const colorImg = ctx.createImageData(w, h);
        const bumpImg = bCtx.createImageData(w, h);
        const cData = colorImg.data;
        const bData = bumpImg.data;

        for (let y = 0; y < h; y++) {
            const v = y / h;
            const lat = Math.abs(v - 0.5) * 2.0; // 0 at equator, 1 at poles

            for (let x = 0; x < w; x++) {
                const u = x / w;
                const angle = u * Math.PI * 2;
                // Seamless horizontal wrapping coordinates
                const sx = Math.cos(angle) * 2.5 + 3.0;
                const sy = Math.sin(angle) * 2.5 + v * 5.0;

                const n1 = this.fbm(sx, sy, 6, seed);
                const n2 = this.fbm(sx * 2.4 + 12, sy * 2.4 + 7, 4, seed + 50);
                let r = 128, g = 128, b = 128;
                let bump = Math.floor(n1 * 255);

                if (type === 'earth' || type === 'exoplanet_habitable') {
                    const isExo = type === 'exoplanet_habitable';
                    const seaLevel = 0.49;
                    if (lat > 0.86 - n2 * 0.08) {
                        // Polar ice cap
                        r = 240; g = 248; b = 255;
                        bump = 190;
                    } else if (n1 < seaLevel) {
                        // Deep & shallow ocean
                        const depth = n1 / seaLevel;
                        r = Math.floor(8 + depth * 22);
                        g = Math.floor(38 + depth * (isExo ? 110 : 75));
                        b = Math.floor(95 + depth * 125);
                        bump = 40;
                    } else {
                        // Landmasses, forests, deserts, mountains
                        const elev = (n1 - seaLevel) / (1 - seaLevel);
                        if (isExo) {
                            // Exotic reddish/teal biosphere or lush world
                            r = Math.floor(55 + elev * 150 + n2 * 40);
                            g = Math.floor(95 + (1 - elev) * 70);
                            b = Math.floor(65 + elev * 50);
                        } else {
                            if (elev < 0.25) {
                                r = 34 + n2 * 30; g = 115 + n2 * 40; b = 45;
                            } else if (elev < 0.58) {
                                r = 135 + n2 * 55; g = 125 + n2 * 35; b = 72;
                            } else {
                                r = 175 + elev * 70; g = 170 + elev * 70; b = 168 + elev * 70;
                            }
                        }
                        bump = Math.floor(120 + elev * 135);
                    }
                } else if (type === 'mars') {
                    const canyon = Math.pow(n1, 1.4);
                    if (lat > 0.90 - n2 * 0.05) {
                        r = 235; g = 225; b = 220;
                    } else {
                        r = Math.floor(145 + canyon * 95);
                        g = Math.floor(52 + canyon * 58);
                        b = Math.floor(24 + canyon * 32);
                    }
                    bump = Math.floor(canyon * 255);
                } else if (type === 'jupiter' || type === 'saturn') {
                    const isSaturn = type === 'saturn';
                    const bandFreq = isSaturn ? 18 : 26;
                    const turb = (n1 - 0.5) * 0.22;
                    const band = Math.sin((v + turb) * bandFreq * Math.PI);
                    const zone = (band + 1) * 0.5;
                    if (isSaturn) {
                        r = Math.floor(195 + zone * 48);
                        g = Math.floor(168 + zone * 45);
                        b = Math.floor(112 + zone * 38);
                    } else {
                        r = Math.floor(165 + zone * 78);
                        g = Math.floor(105 + zone * 75 + (1 - zone) * 20);
                        b = Math.floor(68 + zone * 65);
                    }
                    bump = Math.floor(110 + zone * 45);
                } else if (type === 'uranus' || type === 'neptune') {
                    const isNeptune = type === 'neptune';
                    const band = Math.sin((v + (n1 - 0.5) * 0.1) * 14 * Math.PI) * 0.5 + 0.5;
                    if (isNeptune) {
                        r = Math.floor(22 + band * 35);
                        g = Math.floor(72 + band * 68);
                        b = Math.floor(175 + band * 75);
                    } else {
                        r = Math.floor(95 + band * 55);
                        g = Math.floor(205 + band * 40);
                        b = Math.floor(225 + band * 28);
                    }
                    bump = Math.floor(115 + band * 30);
                } else if (type === 'venus') {
                    const swirl = Math.sin((v * 8 + n1 * 3.5) * Math.PI) * 0.5 + 0.5;
                    r = Math.floor(195 + swirl * 52);
                    g = Math.floor(142 + swirl * 58);
                    b = Math.floor(55 + swirl * 42);
                    bump = Math.floor(n1 * 180);
                } else if (type === 'lava' || type === 'io') {
                    const isIo = type === 'io';
                    const crack = Math.abs(n1 - 0.5) < 0.045;
                    if (crack) {
                        r = 255; g = isIo ? 220 : 95; b = 10;
                        bump = 40;
                    } else {
                        r = Math.floor((isIo ? 185 : 55) + n2 * 60);
                        g = Math.floor((isIo ? 155 : 25) + n2 * 55);
                        b = Math.floor(20 + n2 * 25);
                        bump = Math.floor(130 + n1 * 120);
                    }
                } else if (type === 'ice' || type === 'pluto') {
                    const crack = Math.abs(n2 - 0.5) < 0.03;
                    r = crack ? 120 : Math.floor(185 + n1 * 65);
                    g = crack ? 165 : Math.floor(205 + n1 * 48);
                    b = crack ? 210 : Math.floor(225 + n1 * 30);
                    bump = crack ? 60 : Math.floor(140 + n1 * 110);
                } else if (type.startsWith('star_')) {
                    const plasma = Math.pow(n1, 1.2);
                    if (type === 'star_red') {
                        r = 255; g = Math.floor(45 + plasma * 110); b = Math.floor(15 + plasma * 40);
                    } else if (type === 'star_blue') {
                        r = Math.floor(140 + plasma * 115); g = Math.floor(200 + plasma * 55); b = 255;
                    } else if (type === 'star_orange') {
                        r = 255; g = Math.floor(110 + plasma * 110); b = Math.floor(20 + plasma * 60);
                    } else {
                        r = 255; g = Math.floor(175 + plasma * 80); b = Math.floor(45 + plasma * 140);
                    }
                    bump = Math.floor(plasma * 255);
                } else {
                    // Mercury / Moon / Asteroid rocky cratered surface
                    const rock = 90 + n1 * 115 + (n2 - 0.5) * 35;
                    r = g = b = Math.min(245, Math.max(35, Math.floor(rock)));
                    bump = Math.floor(n1 * 255);
                }

                const idx = (y * w + x) * 4;
                cData[idx] = r;
                cData[idx + 1] = g;
                cData[idx + 2] = b;
                cData[idx + 3] = 255;

                bData[idx] = bump;
                bData[idx + 1] = bump;
                bData[idx + 2] = bump;
                bData[idx + 3] = 255;
            }
        }

        ctx.putImageData(colorImg, 0, 0);
        bCtx.putImageData(bumpImg, 0, 0);

        // Add craters for rocky bodies or Great Red Spot for Jupiter
        if (type === 'mercury' || type === 'moon' || type === 'asteroid' || type === 'mars') {
            for (let i = 0; i < 140; i++) {
                const cx = Math.random() * w;
                const cy = 40 + Math.random() * (h - 80);
                const rad = 4 + Math.random() * 28;

                const bGrad = bCtx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
                bGrad.addColorStop(0, 'rgba(25,25,25,0.65)');
                bGrad.addColorStop(0.82, 'rgba(245,245,245,0.65)');
                bGrad.addColorStop(1, 'rgba(128,128,128,0)');
                bCtx.fillStyle = bGrad;
                bCtx.beginPath();
                bCtx.arc(cx, cy, rad, 0, Math.PI * 2);
                bCtx.fill();

                const cGrad = ctx.createRadialGradient(cx, cy, rad * 0.2, cx, cy, rad);
                cGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
                cGrad.addColorStop(0.85, 'rgba(255,255,255,0.18)');
                cGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = cGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, rad, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'jupiter') {
            // Great Red Spot
            const gx = w * 0.62, gy = h * 0.66;
            ctx.save();
            ctx.translate(gx, gy);
            ctx.scale(1.8, 1.0);
            const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
            grad.addColorStop(0, 'rgba(215, 58, 32, 0.92)');
            grad.addColorStop(0.65, 'rgba(235, 110, 62, 0.75)');
            grad.addColorStop(1, 'rgba(215, 140, 95, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, 34, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const result = {
            colorMap: this.configureTexture(new THREE.CanvasTexture(colorCanvas)),
            bumpMap: this.configureTexture(new THREE.CanvasTexture(bumpCanvas))
        };
        this.cache.set(cacheKey, result);
        return result;
    }

    // Load real internet texture and upgrade the material seamlessly when ready
    applyInternetTexture(url, material, mapSlot = 'map') {
        if (!url) return;
        if (this.cache.has(url)) {
            material[mapSlot] = this.cache.get(url);
            material.needsUpdate = true;
            return;
        }
        this.loader.load(
            url,
            (tex) => {
                this.configureTexture(tex);
                this.cache.set(url, tex);
                material[mapSlot] = tex;
                material.needsUpdate = true;
            },
            undefined,
            () => {
                // Procedural fallback is already bound, so no action needed on network error
            }
        );
    }

    // Generate translucent cloud map
    getCloudTexture(seed = 1) {
        const key = `clouds_${seed}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const w = 1024, h = 512;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(w, h);
        const data = img.data;

        for (let y = 0; y < h; y++) {
            const v = y / h;
            for (let x = 0; x < w; x++) {
                const u = x / w;
                const angle = u * Math.PI * 2;
                const sx = Math.cos(angle) * 3.0 + 5.0;
                const sy = Math.sin(angle) * 3.0 + v * 6.0;
                const n = this.fbm(sx, sy, 5, seed + 300);
                const alpha = Math.max(0, Math.min(255, Math.floor((n - 0.46) * 520)));
                const idx = (y * w + x) * 4;
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = alpha;
            }
        }
        ctx.putImageData(img, 0, 0);
        const tex = this.configureTexture(new THREE.CanvasTexture(canvas));
        this.cache.set(key, tex);
        return tex;
    }

    // Generate radial planetary ring texture (with Cassini Division & fine particle bands)
    getRingTexture(baseColorHex = '#e7d3b0', detailed = true) {
        const key = `ring_${baseColorHex}_${detailed}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const w = 1024, h = 64;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        const baseColor = new THREE.Color(baseColorHex);
        for (let x = 0; x < w; x++) {
            const t = x / w; // 0 = inner edge, 1 = outer edge
            let alpha = Math.sin(t * Math.PI); // Smooth fade at inner/outer edges

            if (detailed) {
                // Multi-frequency ring ringlets and Cassini Division gap around t = 0.62 - 0.68
                const wave1 = Math.sin(t * 140) * 0.2 + 0.8;
                const wave2 = Math.sin(t * 430) * 0.15 + 0.85;
                alpha *= wave1 * wave2;
                if (t > 0.61 && t < 0.66) alpha *= 0.08; // Cassini Division
                if (t > 0.84 && t < 0.86) alpha *= 0.15; // Encke Gap
            }

            const shade = 0.75 + 0.25 * Math.sin(t * 95);
            const r = Math.min(255, Math.floor(baseColor.r * 255 * shade));
            const g = Math.min(255, Math.floor(baseColor.g * 255 * shade));
            const b = Math.min(255, Math.floor(baseColor.b * 255 * shade));

            ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
            ctx.fillRect(x, 0, 1, h);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        this.cache.set(key, tex);
        return tex;
    }

    // Generate soft radial glow sprite texture for stars, coronas, and galaxies
    getGlowSpriteTexture(innerHex = '#ffffff', outerHex = '#00aaff') {
        const key = `glow_${innerHex}_${outerHex}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const c1 = new THREE.Color(innerHex);
        const c2 = new THREE.Color(outerHex);

        const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
        grad.addColorStop(0.0, `rgba(255, 255, 255, 1.0)`);
        grad.addColorStop(0.22, `rgba(${Math.floor(c1.r * 255)}, ${Math.floor(c1.g * 255)}, ${Math.floor(c1.b * 255)}, 0.85)`);
        grad.addColorStop(0.55, `rgba(${Math.floor(c2.r * 255)}, ${Math.floor(c2.g * 255)}, ${Math.floor(c2.b * 255)}, 0.28)`);
        grad.addColorStop(1.0, `rgba(0, 0, 0, 0.0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        const tex = new THREE.CanvasTexture(canvas);
        this.cache.set(key, tex);
        return tex;
    }
}

window.TextureEngine = TextureEngine;
