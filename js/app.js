// ============================================================================
// COSMOS 3D - MAIN 3D ENGINE, 360° FLIGHT CONTROLLER & PROGRESSIVE LOD SYSTEM
// ============================================================================

class CosmosSimulator {
    constructor() {
        this.container = document.getElementById('game-container');
        this.canvas = document.getElementById('space-canvas');

        // Current State
        this.currentGalaxy = window.SPACE_DATA.galaxies[0];
        this.currentSystem = this.currentGalaxy.systems[0];
        this.celestialObjects = []; // Interactive stars, planets, moons
        this.planetEntries = [];
        this.starEntries = [];
        this.orbitLines = [];
        this.showOrbits = true;

        // Flight & Physics State (Quaternion 360° 6-DOF)
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3(); // pitch, yaw, roll rates
        this.baseCruiseSpeed = window.SPACE_DATA.cruiseSpeedDefault || 360; // ~1 min between planets
        this.driveMultiplier = 1.0;
        this.fineSpeedFactor = 1.0;
        this.orbitTimeScale = 1.0;

        // Input State
        this.keys = {};
        this.isPointerLocked = false;
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };

        // Target & Autopilot State
        this.selectedTarget = null;
        this.autopilotActive = false;
        this.lockedOrbitTarget = null;
        this.lastLockedWorldPos = new THREE.Vector3();

        // Reusable vectors/quaternions
        this.tmpVec1 = new THREE.Vector3();
        this.tmpVec2 = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();
        this.eulerOrder = new THREE.Euler(0, 0, 0, 'YXZ');

        this.clock = new THREE.Clock();

        // 3rd Person Follow Camera Modes (Default: 3rd person above following the spaceship!)
        this.cameraModes = [
            {
                id: 'chase_high',
                name: '3. Şahıs (Yukarıdan Takip)',
                shortName: '3. Şahıs (Üst)',
                offset: new THREE.Vector3(0, 22, 58),       // Elevated 22 units above, 58 behind
                lookAt: new THREE.Vector3(0, 4, -40),       // Looking ahead and slightly down over ship's nose
                followSpeed: 14.0,
                isCockpit: false
            },
            {
                id: 'chase_far',
                name: '3. Şahıs (Geniş Açı / Uzak)',
                shortName: '3. Şahıs (Uzak)',
                offset: new THREE.Vector3(0, 42, 110),      // High and far back for panoramic planet vistas
                lookAt: new THREE.Vector3(0, 6, -50),
                followSpeed: 10.0,
                isCockpit: false
            },
            {
                id: 'chase_close',
                name: '3. Şahıs (Yakın Takip)',
                shortName: '3. Şahıs (Yakın)',
                offset: new THREE.Vector3(0, 11, 32),       // Closer behind the ship
                lookAt: new THREE.Vector3(0, 2, -30),
                followSpeed: 18.0,
                isCockpit: false
            },
            {
                id: 'cockpit',
                name: '1. Şahıs (Kokpit)',
                shortName: '1. Şahıs (Kokpit)',
                offset: new THREE.Vector3(0, 1.2, -3.2),    // Inside/front of cockpit canopy
                lookAt: new THREE.Vector3(0, 1.2, -80),
                followSpeed: 25.0,
                isCockpit: true
            }
        ];
        this.currentCameraModeIndex = 0; // Starts in 3rd Person Elevated Follow
        this.cameraSnapNeeded = true;
        this.lastYawRate = 0;
        this.currentBankRoll = 0;

        this.calculateGameArea();
        this.initThree();
        this.textureEngine = new window.TextureEngine(this.renderer);
        this.initSpaceship();
        this.initUI();
        this.initControls();
        this.loadStarSystem(this.currentGalaxy.id, this.currentSystem.id, true);

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    // ========================================================================
    // SCREEN AREA CALCULATION & RESPONSIVE COMPONENT FITTING
    // ========================================================================
    calculateGameArea() {
        const vw = window.innerWidth || document.documentElement.clientWidth || window.screen.availWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight || window.screen.availHeight;

        // Calculate optimal UI scale factor based on the user's machine screen resolution
        const baseWidth = 1600;
        const baseHeight = 900;
        const scaleW = vw / baseWidth;
        const scaleH = vh / baseHeight;
        const uiScale = Math.max(0.72, Math.min(1.35, Math.min(scaleW, scaleH)));

        const root = document.documentElement;
        root.style.setProperty('--game-width', `${vw}px`);
        root.style.setProperty('--game-height', `${vh}px`);
        root.style.setProperty('--ui-scale', uiScale.toFixed(3));

        if (this.renderer && this.camera) {
            this.camera.aspect = vw / vh;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(vw, vh, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }
    }

    // ========================================================================
    // THREE.JS INITIALIZATION & ATMOSPHERIC SHADERS
    // ========================================================================
    initThree() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        this.scene = new THREE.Scene();
        // Logarithmic depth buffer allows rendering tiny close-up moons (10 units away)
        // and distant outer planets/galaxies (3,000,000 units away) without Z-fighting!
        this.camera = new THREE.PerspectiveCamera(60, vw / vh, 2, 4000000);
        this.camera.position.set(0, 4500, 66000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(vw, vh, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.systemGroup = new THREE.Group();
        this.backgroundGroup = new THREE.Group();
        this.scene.add(this.backgroundGroup);
        this.scene.add(this.systemGroup);

        // Ambient starlight + hemisphere fill so dark sides of planets have subtle realistic visibility
        this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.55);
        this.scene.add(this.ambientLight);

        // Shared LOD Sphere Geometries (Low, Med, Ultra-High for close approach)
        this.geoLow = new THREE.SphereGeometry(1, 24, 24);
        this.geoMed = new THREE.SphereGeometry(1, 48, 48);
        this.geoHigh = new THREE.SphereGeometry(1, 96, 96);

        window.addEventListener('resize', () => this.calculateGameArea());
    }

    // ========================================================================
    // 3D SPACESHIP & 3RD PERSON FOLLOW CAMERA SYSTEM
    // ========================================================================
    initSpaceship() {
        this.ship = new THREE.Group();
        this.shipVisual = new THREE.Group();
        this.ship.add(this.shipVisual);

        // Materials
        const hullMat = new THREE.MeshStandardMaterial({
            color: 0x141d2b,
            metalness: 0.85,
            roughness: 0.32,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const accentMat = new THREE.MeshStandardMaterial({
            color: 0xdde6ed,
            metalness: 0.72,
            roughness: 0.35,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const neonMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff
        });

        const canopyMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x003344,
            emissiveIntensity: 0.6,
            roughness: 0.15,
            metalness: 0.9,
            transparent: true,
            opacity: 0.85
        });

        const engineMat = new THREE.MeshStandardMaterial({
            color: 0x242b35,
            metalness: 0.9,
            roughness: 0.25
        });

        // 1. Central Aerospace Fuselage
        const bodyGeo = new THREE.CylinderGeometry(0.85, 2.2, 12, 6);
        bodyGeo.rotateX(Math.PI * 0.5);
        const bodyMesh = new THREE.Mesh(bodyGeo, hullMat);
        bodyMesh.scale.set(1.1, 0.65, 1.0);
        bodyMesh.position.set(0, 0, 0);
        this.shipVisual.add(bodyMesh);

        // Sleek Forward Nose Cone (Faces -Z)
        const noseGeo = new THREE.ConeGeometry(1.65, 9.5, 6);
        noseGeo.rotateX(-Math.PI * 0.5);
        const noseMesh = new THREE.Mesh(noseGeo, accentMat);
        noseMesh.scale.set(0.9, 0.45, 1.0);
        noseMesh.position.set(0, -0.05, -9.6);
        this.shipVisual.add(noseMesh);

        // Nose tip sensor probe
        const probeGeo = new THREE.CylinderGeometry(0.08, 0.22, 3.8, 8);
        probeGeo.rotateX(Math.PI * 0.5);
        const probeMesh = new THREE.Mesh(probeGeo, neonMat);
        probeMesh.position.set(0, -0.05, -15.2);
        this.shipVisual.add(probeMesh);

        // 2. Cockpit Canopy
        const canopyGeo = new THREE.SphereGeometry(1.4, 16, 12);
        const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
        canopyMesh.scale.set(0.72, 0.52, 2.4);
        canopyMesh.position.set(0, 0.92, -3.2);
        this.shipVisual.add(canopyMesh);

        // 3. Swept Delta Wings with Winglets
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(-11.8, 4.5);
        wingShape.lineTo(-12.6, 1.6);
        wingShape.lineTo(-1.8, -6.8);
        wingShape.closePath();

        const extrudeSettings = { depth: 0.35, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 };
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
        wingGeo.rotateX(Math.PI * 0.5);

        const leftWing = new THREE.Mesh(wingGeo, hullMat);
        leftWing.position.set(-0.8, -0.1, 1.5);
        this.shipVisual.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, hullMat);
        rightWing.scale.set(-1, 1, 1);
        rightWing.position.set(0.8, -0.1, 1.5);
        this.shipVisual.add(rightWing);

        // Wing Accent Trim Stripes
        const stripeGeo = new THREE.BoxGeometry(0.2, 0.1, 7.5);
        const leftStripe = new THREE.Mesh(stripeGeo, neonMat);
        leftStripe.position.set(-5.6, 0.15, 0.2);
        leftStripe.rotation.y = -0.45;
        this.shipVisual.add(leftStripe);

        const rightStripe = new THREE.Mesh(stripeGeo, neonMat);
        rightStripe.position.set(5.6, 0.15, 0.2);
        rightStripe.rotation.y = 0.45;
        this.shipVisual.add(rightStripe);

        // Wingtip Vertical Stabilizers (Winglets)
        const wingletGeo = new THREE.BoxGeometry(0.25, 2.2, 3.6);
        const leftWinglet = new THREE.Mesh(wingletGeo, accentMat);
        leftWinglet.position.set(-12.4, 0.9, 3.2);
        leftWinglet.rotation.z = -0.22;
        this.shipVisual.add(leftWinglet);

        const rightWinglet = new THREE.Mesh(wingletGeo, accentMat);
        rightWinglet.position.set(12.4, 0.9, 3.2);
        rightWinglet.rotation.z = 0.22;
        this.shipVisual.add(rightWinglet);

        // Top Dorsal Stabilizer Fin
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.lineTo(0, 2.8);
        finShape.lineTo(2.4, 0);
        finShape.closePath();
        const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 });
        finGeo.rotateY(Math.PI * 0.5);
        const finMesh = new THREE.Mesh(finGeo, accentMat);
        finMesh.position.set(0.15, 0.7, 3.5);
        this.shipVisual.add(finMesh);

        // 4. Twin Ion Thruster Engines
        const engineGeo = new THREE.CylinderGeometry(0.95, 1.15, 3.6, 16);
        engineGeo.rotateX(Math.PI * 0.5);

        const leftEngine = new THREE.Mesh(engineGeo, engineMat);
        leftEngine.position.set(-2.0, 0.1, 6.0);
        this.shipVisual.add(leftEngine);

        const rightEngine = new THREE.Mesh(engineGeo, engineMat);
        rightEngine.position.set(2.0, 0.1, 6.0);
        this.shipVisual.add(rightEngine);

        // Engine Glowing Interior Rings
        const ringGeo = new THREE.RingGeometry(0.3, 0.85, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide });
        const leftRing = new THREE.Mesh(ringGeo, ringMat);
        leftRing.position.set(-2.0, 0.1, 7.82);
        this.shipVisual.add(leftRing);

        const rightRing = new THREE.Mesh(ringGeo, ringMat);
        rightRing.position.set(2.0, 0.1, 7.82);
        this.shipVisual.add(rightRing);

        // 5. Plasma Exhaust Cones
        const plumeGeo = new THREE.ConeGeometry(0.85, 5.0, 16, 1, true);
        plumeGeo.rotateX(Math.PI * 0.5);
        plumeGeo.translate(0, 0, 2.5);

        const plumeMat = new THREE.MeshBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const leftPlume = new THREE.Mesh(plumeGeo, plumeMat);
        leftPlume.position.set(-2.0, 0.1, 7.82);
        this.shipVisual.add(leftPlume);

        const rightPlume = new THREE.Mesh(plumeGeo, plumeMat.clone());
        rightPlume.position.set(2.0, 0.1, 7.82);
        this.shipVisual.add(rightPlume);

        // Inner core plumes (bright white core)
        const coreGeo = new THREE.ConeGeometry(0.42, 3.2, 16, 1, true);
        coreGeo.rotateX(Math.PI * 0.5);
        coreGeo.translate(0, 0, 1.6);

        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const leftCore = new THREE.Mesh(coreGeo, coreMat);
        leftCore.position.set(-2.0, 0.1, 7.82);
        this.shipVisual.add(leftCore);

        const rightCore = new THREE.Mesh(coreGeo, coreMat.clone());
        rightCore.position.set(2.0, 0.1, 7.82);
        this.shipVisual.add(rightCore);

        this.enginePlumes = [leftPlume, rightPlume];
        this.engineCores = [leftCore, rightCore];

        // Engine glow light
        this.engineLight = new THREE.PointLight(0x00e5ff, 1.8, 48);
        this.engineLight.position.set(0, 0.1, 8.5);
        this.shipVisual.add(this.engineLight);

        // 6. Navigation Lights
        const navRed = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
        navRed.position.set(-12.4, 1.8, 3.2);
        this.shipVisual.add(navRed);

        const navGreen = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00e676 }));
        navGreen.position.set(12.4, 1.8, 3.2);
        this.shipVisual.add(navGreen);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        beacon.position.set(0, 3.4, 3.5);
        this.shipVisual.add(beacon);
        this.navBeacon = beacon;

        // Initialize engine particle trail system
        this.initEngineTrails();

        // Add to main scene
        this.scene.add(this.ship);
    }

    initEngineTrails() {
        this.trailParticles = [];
        this.maxTrailParticles = 50;
        const trailGeo = new THREE.SphereGeometry(0.35, 6, 6);
        const trailMat = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.trailGroup = new THREE.Group();
        this.scene.add(this.trailGroup);

        for (let i = 0; i < this.maxTrailParticles; i++) {
            const mesh = new THREE.Mesh(trailGeo, trailMat.clone());
            mesh.visible = false;
            this.trailGroup.add(mesh);
            this.trailParticles.push({
                mesh,
                life: 0,
                maxLife: 0.75
            });
        }
        this.trailSpawnTimer = 0;
    }

    updateEngineTrails(dt, isThrusting) {
        if (!this.trailParticles || !this.ship) return;

        this.trailSpawnTimer += dt;
        if (isThrusting && this.trailSpawnTimer > 0.035) {
            this.trailSpawnTimer = 0;
            const leftPos = new THREE.Vector3(-2.0, 0.1, 7.8).applyMatrix4(this.ship.matrixWorld);
            const rightPos = new THREE.Vector3(2.0, 0.1, 7.8).applyMatrix4(this.ship.matrixWorld);
            this.spawnTrailParticle(leftPos);
            this.spawnTrailParticle(rightPos);
        }

        this.trailParticles.forEach(p => {
            if (!p.mesh.visible) return;
            p.life += dt;
            if (p.life >= p.maxLife) {
                p.mesh.visible = false;
            } else {
                const progress = p.life / p.maxLife;
                p.mesh.material.opacity = Math.max(0, (1.0 - progress) * 0.75);
                p.mesh.scale.setScalar(0.7 + progress * 2.4);
            }
        });
    }

    spawnTrailParticle(pos) {
        const p = this.trailParticles.find(item => !item.mesh.visible);
        if (!p) return;
        p.mesh.position.copy(pos);
        p.life = 0;
        p.mesh.visible = true;
        p.mesh.material.opacity = 0.75;
        p.mesh.scale.setScalar(0.7);
    }

    animateThrusters(dt, forwardInput, shiftBoost) {
        if (!this.enginePlumes) return;
        const isThrusting = forwardInput > 0 || this.autopilotActive || this.velocity.lengthSq() > 10;
        const boostMult = shiftBoost > 1.0 ? 2.6 : 1.0;
        const targetScaleZ = isThrusting ? (1.6 + Math.random() * 0.45) * boostMult : 0.45;
        const targetOpacity = isThrusting ? (0.85 + Math.random() * 0.15) : 0.35;

        this.enginePlumes.forEach(plume => {
            plume.scale.z += (targetScaleZ - plume.scale.z) * Math.min(1.0, dt * 14.0);
            plume.material.opacity = targetOpacity;
        });

        this.engineCores.forEach(core => {
            core.scale.z += (targetScaleZ * 0.85 - core.scale.z) * Math.min(1.0, dt * 14.0);
            core.material.opacity = isThrusting ? 0.95 : 0.4;
        });

        if (this.engineLight) {
            this.engineLight.intensity = isThrusting ? (2.4 * boostMult) : 0.7;
        }

        if (this.navBeacon) {
            const time = this.clock.getElapsedTime();
            this.navBeacon.visible = (Math.sin(time * 6.5) > 0.3);
        }
    }

    updateCamera(dt) {
        if (!this.ship) return;

        const currentMode = this.cameraModes[this.currentCameraModeIndex];
        const offset = currentMode.offset.clone().applyQuaternion(this.ship.quaternion);
        const targetCamPos = this.ship.position.clone().add(offset);

        const lookOffset = currentMode.lookAt.clone().applyQuaternion(this.ship.quaternion);
        const targetLookPos = this.ship.position.clone().add(lookOffset);

        if (this.cameraSnapNeeded) {
            this.camera.position.copy(targetCamPos);
            const shipUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.ship.quaternion);
            this.camera.up.copy(shipUp);
            this.camera.lookAt(targetLookPos);
            this.cameraSnapNeeded = false;
            return;
        }

        const posLerp = Math.min(1.0, dt * currentMode.followSpeed);
        this.camera.position.lerp(targetCamPos, posLerp);

        const shipUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.ship.quaternion);
        this.camera.up.lerp(shipUp, Math.min(1.0, dt * 10.0));
        this.camera.lookAt(targetLookPos);

        if (this.shipVisual) {
            this.shipVisual.visible = !currentMode.isCockpit;
        }
    }

    toggleCameraMode() {
        this.currentCameraModeIndex = (this.currentCameraModeIndex + 1) % this.cameraModes.length;
        const currentMode = this.cameraModes[this.currentCameraModeIndex];
        const btn = document.getElementById('btn-toggle-camera');
        if (btn) {
            btn.textContent = `🎥 Kamera: ${currentMode.shortName} (C)`;
        }
    }

    // Create Rayleigh Atmospheric Scattering Halo Mesh (Fresnel Rim Shader)
    createAtmosphereMesh(radius, colorHex, opacity = 0.4) {
        const color = new THREE.Color(colorHex);
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: color },
                coef: { value: 0.65 },
                power: { value: 3.4 },
                alpha: { value: opacity }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float coef;
                uniform float power;
                uniform float alpha;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vec3 viewDir = normalize(vViewPosition);
                    float intensity = pow(clamp(coef - dot(vNormal, viewDir), 0.0, 1.0), power);
                    gl_FragColor = vec4(glowColor, intensity * alpha);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(this.geoMed, mat);
        mesh.scale.setScalar(radius * 1.15);
        return mesh;
    }

    // ========================================================================
    // DEEP SPACE STARFIELD, NEBULAE & 3D BACKGROUND GALAXIES
    // ========================================================================
    buildDeepSpaceBackground(galaxyData) {
        while (this.backgroundGroup.children.length > 0) {
            const child = this.backgroundGroup.children[0];
            this.backgroundGroup.remove(child);
        }

        // 1. 12,000 Multi-Spectral 3D Stars
        const starCount = 12000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const spectralPalette = [
            new THREE.Color('#9bb0ff'), // O/B blue-white
            new THREE.Color('#cad7ff'), // A white
            new THREE.Color('#f8f7ff'), // F yellow-white
            new THREE.Color('#fff4ea'), // G yellow
            new THREE.Color('#ffd2a1'), // K orange
            new THREE.Color('#ffcc6f')  // M red-orange
        ];

        for (let i = 0; i < starCount; i++) {
            const r = 900000 + Math.random() * 1200000;
            const theta = Math.random() * Math.PI * 2;
            // Concentrate 45% of stars near galactic plane for a realistic Milky Way band
            const inBand = Math.random() < 0.45;
            const phi = inBand
                ? (Math.PI * 0.5 + (Math.random() - 0.5) * 0.28)
                : Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.cos(phi);
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const col = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
            const brightness = 0.65 + Math.random() * 0.35;
            colors[i * 3] = col.r * brightness;
            colors[i * 3 + 1] = col.g * brightness;
            colors[i * 3 + 2] = col.b * brightness;
        }

        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 2400,
            vertexColors: true,
            transparent: true,
            opacity: 0.92,
            sizeAttenuation: true,
            depthWrite: false
        });
        this.backgroundGroup.add(new THREE.Points(starGeo, starMat));

        // 2. Volumetric Galactic Nebula Clouds
        const nebColors = galaxyData.nebulaColors || ['#0077ff', '#7b2cbf', '#00f5d4'];
        for (let i = 0; i < 28; i++) {
            const cHex = nebColors[i % nebColors.length];
            const spriteMat = new THREE.SpriteMaterial({
                map: this.textureEngine.getGlowSpriteTexture(cHex, cHex),
                color: cHex,
                transparent: true,
                opacity: 0.08 + Math.random() * 0.08,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMat);
            const dist = 850000;
            const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const elev = (Math.random() - 0.5) * 260000;
            sprite.position.set(Math.cos(angle) * dist, elev, Math.sin(angle) * dist);
            const scale = 320000 + Math.random() * 380000;
            sprite.scale.set(scale, scale * 0.65, 1);
            this.backgroundGroup.add(sprite);
        }

        // 3. Distant 3D Spiral Galaxies visible in deep space
        window.SPACE_DATA.galaxies.forEach((gal, idx) => {
            if (gal.id === galaxyData.id) return;
            const galGroup = this.createDistantSpiralGalaxyMesh(gal, idx);
            this.backgroundGroup.add(galGroup);
        });
    }

    createDistantSpiralGalaxyMesh(gal, index) {
        const group = new THREE.Group();
        const count = 2500;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const cCore = new THREE.Color(gal.nebulaColors[0] || '#ffddaa');
        const cArm = new THREE.Color(gal.nebulaColors[1] || '#00bbff');

        for (let i = 0; i < count; i++) {
            const radius = Math.pow(Math.random(), 1.5) * 95000;
            const spinAngle = radius * 0.000085;
            const branchAngle = ((i % 2) / 2) * Math.PI * 2;
            const spread = (Math.random() - 0.5) * 14000;

            pos[i * 3] = Math.cos(branchAngle + spinAngle) * radius + spread;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 8000;
            pos[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + spread;

            const mixRatio = radius / 95000;
            const mixed = cCore.clone().lerp(cArm, mixRatio);
            col[i * 3] = mixed.r;
            col[i * 3 + 1] = mixed.g;
            col[i * 3 + 2] = mixed.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mat = new THREE.PointsMaterial({
            size: 2800,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });
        const points = new THREE.Points(geo, mat);
        group.add(points);

        const angle = (index + 1) * 1.85;
        group.position.set(Math.cos(angle) * 780000, 180000 * (index % 2 === 0 ? 1 : -1), Math.sin(angle) * 780000);
        group.rotation.x = 0.7;
        group.rotation.z = 0.4;
        return group;
    }

    // ========================================================================
    // STAR SYSTEM BUILDER (STARS, PLANETS, MOONS, RINGS, ASTEROID BELTS)
    // ========================================================================
    loadStarSystem(galaxyId, systemId, isInitial = false) {
        const galaxy = window.SPACE_DATA.galaxies.find(g => g.id === galaxyId) || window.SPACE_DATA.galaxies[0];
        const system = galaxy.systems.find(s => s.id === systemId) || galaxy.systems[0];

        this.currentGalaxy = galaxy;
        this.currentSystem = system;
        this.lockedOrbitTarget = null;
        this.autopilotActive = false;

        // Clear previous system objects
        while (this.systemGroup.children.length > 0) {
            this.systemGroup.remove(this.systemGroup.children[0]);
        }
        this.celestialObjects = [];
        this.planetEntries = [];
        this.starEntries = [];
        this.orbitLines = [];

        this.buildDeepSpaceBackground(galaxy);

        // 1. Build Central Star(s) or Black Hole
        system.stars.forEach((starData, idx) => {
            const starEntry = this.createStarObject(starData, idx);
            this.systemGroup.add(starEntry.root);
            this.starEntries.push(starEntry);
            this.celestialObjects.push(starEntry);
        });

        // 2. Build Asteroid Belt & Kuiper Belt if present
        if (system.asteroidBelt) {
            this.asteroidBeltMesh = this.createAsteroidBelt(system.asteroidBelt);
            this.systemGroup.add(this.asteroidBeltMesh);
        } else {
            this.asteroidBeltMesh = null;
        }

        if (system.kuiperBelt) {
            this.kuiperBeltMesh = this.createAsteroidBelt(system.kuiperBelt);
            this.systemGroup.add(this.kuiperBeltMesh);
        } else {
            this.kuiperBeltMesh = null;
        }

        // 3. Build Planets & Their Natural Moons
        system.bodies.forEach((bodyData, idx) => {
            const planetEntry = this.createPlanetObject(bodyData, idx);
            this.systemGroup.add(planetEntry.orbitLine);
            this.orbitLines.push(planetEntry.orbitLine);
            this.systemGroup.add(planetEntry.root);
            this.planetEntries.push(planetEntry);
            this.celestialObjects.push(planetEntry);

            // Register moons in celestialObjects for targeting & inspection
            planetEntry.moons.forEach(m => this.celestialObjects.push(m));
        });

        // Position spacecraft near Earth (if Solar System) or 3rd/1st planet
        const defaultPlanet = this.planetEntries.find(p => p.data.id === 'earth') || this.planetEntries[0];
        if (defaultPlanet) {
            this.updateSystemOrbits(0);
            const wp = new THREE.Vector3();
            defaultPlanet.root.getWorldPosition(wp);
            const r = defaultPlanet.data.radius;
            this.camera.position.set(wp.x + r * 4.2, wp.y + r * 1.4, wp.z + r * 4.2);
            this.camera.lookAt(wp);
            this.selectTarget(defaultPlanet);
        } else {
            this.camera.position.set(0, 6000, 35000);
            this.camera.lookAt(0, 0, 0);
        }

        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.refreshHUDSystemInfo();
    }

    createStarObject(starData) {
        const root = new THREE.Group();
        const isBlackHole = starData.proceduralType === 'black_hole';

        let mesh;
        if (isBlackHole) {
            // Event Horizon Sphere (Pitch black)
            const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            mesh = new THREE.Mesh(this.geoHigh, bhMat);
            mesh.scale.setScalar(starData.radius);
            root.add(mesh);

            // Relativistic Glowing Accretion Disk
            const diskGeo = new THREE.RingGeometry(starData.radius * 1.35, starData.radius * 3.8, 128);
            const diskTex = this.textureEngine.getRingTexture('#00e5ff', true);
            const diskMat = new THREE.MeshBasicMaterial({
                map: diskTex,
                color: 0x80ffdb,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.92,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const disk = new THREE.Mesh(diskGeo, diskMat);
            disk.rotation.x = Math.PI * 0.42;
            root.add(disk);
        } else {
            const proc = this.textureEngine.generatePlanetTextures(starData.proceduralType || 'star_yellow', starData.id);
            const mat = new THREE.MeshBasicMaterial({
                map: proc.colorMap,
                color: 0xffffff
            });
            if (starData.textureUrl) {
                this.textureEngine.applyInternetTexture(starData.textureUrl, mat, 'map');
            }
            mesh = new THREE.Mesh(this.geoHigh, mat);
            mesh.scale.setScalar(starData.radius);
            root.add(mesh);
        }

        // Corona Glow Sprite
        const glowTex = this.textureEngine.getGlowSpriteTexture(starData.color, starData.coronaColor || starData.color);
        const spriteMat = new THREE.SpriteMaterial({
            map: glowTex,
            color: starData.coronaColor || starData.color,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glowSprite = new THREE.Sprite(spriteMat);
        glowSprite.scale.setScalar(starData.radius * 6.5);
        root.add(glowSprite);

        // High-range Sunlight Source
        const light = new THREE.PointLight(starData.lightColor || 0xffffff, 2.2, 0, 0);
        root.add(light);

        return {
            isStar: true,
            data: {
                ...starData,
                type: starData.role || 'Yıldız',
                period: starData.orbitRadius > 0 ? 'İkili Yörünge' : 'Sistem Merkezi',
                realDistance: '0.00 AU (Merkez)'
            },
            root,
            mesh,
            orbitAngle: starData.orbitPhase || 0
        };
    }

    createPlanetObject(bodyData, index) {
        const root = new THREE.Group();
        const tiltGroup = new THREE.Group();
        tiltGroup.rotation.z = bodyData.tilt || 0;
        root.add(tiltGroup);

        // Generate Immediate Procedural High-Res Map + Bump Map
        const proc = this.textureEngine.generatePlanetTextures(bodyData.proceduralType || 'earth', bodyData.id);
        const detailBump = this.textureEngine.getHighFreqDetailBump();

        const mat = new THREE.MeshStandardMaterial({
            map: proc.colorMap,
            bumpMap: proc.bumpMap,
            bumpScale: 3.5,
            roughness: bodyData.proceduralType === 'earth' ? 0.55 : 0.82,
            metalness: 0.06
        });

        // Stream real NASA / Wikimedia / Three.js internet texture on top
        if (bodyData.textureUrl) {
            this.textureEngine.applyInternetTexture(bodyData.textureUrl, mat, 'map');
        }
        if (bodyData.normalUrl) {
            this.textureEngine.applyInternetTexture(bodyData.normalUrl, mat, 'normalMap');
        }

        // Main Planet Sphere (Starts at Med geometry, upgrades to High as you approach)
        const mesh = new THREE.Mesh(this.geoMed, mat);
        mesh.scale.setScalar(bodyData.radius);
        tiltGroup.add(mesh);

        // Close-up Micro-Detail Overlay Sphere (Fades in when approaching within 15x radius!)
        const detailMat = new THREE.MeshStandardMaterial({
            map: proc.colorMap,
            bumpMap: detailBump,
            bumpScale: 12.0,
            roughness: 0.75,
            transparent: true,
            opacity: 0.0,
            depthWrite: false
        });
        const detailMesh = new THREE.Mesh(this.geoHigh, detailMat);
        detailMesh.scale.setScalar(bodyData.radius * 1.0015);
        detailMesh.visible = false;
        tiltGroup.add(detailMesh);

        // Dynamic Cloud Layer (for Earth, Venus, habitable exoplanets)
        let cloudMesh = null;
        if (bodyData.hasClouds || bodyData.cloudTextureUrl) {
            const cloudMat = new THREE.MeshStandardMaterial({
                map: this.textureEngine.getCloudTexture(index + 10),
                transparent: true,
                opacity: 0.78,
                blending: THREE.NormalBlending,
                depthWrite: false,
                roughness: 0.9
            });
            if (bodyData.cloudTextureUrl) {
                this.textureEngine.applyInternetTexture(bodyData.cloudTextureUrl, cloudMat, 'map');
            }
            cloudMesh = new THREE.Mesh(this.geoHigh, cloudMat);
            cloudMesh.scale.setScalar(bodyData.radius * 1.016);
            tiltGroup.add(cloudMesh);
        }

        // Rayleigh Scattering Atmosphere Halo
        let atmosMesh = null;
        if (bodyData.atmosphereColor) {
            atmosMesh = this.createAtmosphereMesh(
                bodyData.radius,
                bodyData.atmosphereColor,
                bodyData.atmosphereOpacity || 0.38
            );
            root.add(atmosMesh);
        }

        // Planetary Rings (Saturn, Uranus, Jupiter, Neptune, Exoplanets)
        if (bodyData.rings) {
            const rData = bodyData.rings;
            const ringGeo = new THREE.RingGeometry(rData.innerRadius, rData.outerRadius, 128);
            // Fix RingGeometry UV mapping so radial 1D ring texture wraps around the circle
            const pos = ringGeo.attributes.position;
            const uv = ringGeo.attributes.uv;
            const v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++) {
                v3.fromBufferAttribute(pos, i);
                const len = v3.length();
                const u = (len - rData.innerRadius) / (rData.outerRadius - rData.innerRadius);
                uv.setXY(i, u, 0.5);
            }

            const ringTex = this.textureEngine.getRingTexture(rData.color, rData.detailBands);
            const ringMat = new THREE.MeshStandardMaterial({
                map: ringTex,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: rData.opacity || 0.85,
                roughness: 0.6,
                depthWrite: false
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI * 0.5;
            tiltGroup.add(ringMesh);
        }

        // Orbital Trajectory Line
        const orbitLine = this.createOrbitLine(bodyData.orbitRadius, bodyData.color);

        // Natural Moons
        const moons = [];
        if (bodyData.moons && bodyData.moons.length > 0) {
            bodyData.moons.forEach((moonData, mIdx) => {
                const moonEntry = this.createMoonObject(moonData, bodyData, mIdx);
                root.add(moonEntry.orbitLine);
                root.add(moonEntry.root);
                moons.push(moonEntry);
            });
        }

        // Spread initial orbital angles nicely while keeping neighbor travel ~1 min
        const initialAngle = index * 0.68;

        return {
            isPlanet: true,
            data: bodyData,
            root,
            tiltGroup,
            mesh,
            mat,
            detailMesh,
            detailMat,
            cloudMesh,
            atmosMesh,
            orbitLine,
            moons,
            orbitAngle: initialAngle,
            currentLodLevel: 1,
            lodPercent: 25
        };
    }

    createMoonObject(moonData, parentData, mIdx) {
        const root = new THREE.Group();
        const proc = this.textureEngine.generatePlanetTextures(moonData.proceduralType || 'moon', moonData.id);
        const mat = new THREE.MeshStandardMaterial({
            map: proc.colorMap,
            bumpMap: proc.bumpMap,
            bumpScale: 2.8,
            roughness: 0.88
        });
        if (moonData.textureUrl) {
            this.textureEngine.applyInternetTexture(moonData.textureUrl, mat, 'map');
        }

        const mesh = new THREE.Mesh(this.geoMed, mat);
        mesh.scale.setScalar(moonData.radius);
        root.add(mesh);

        const orbitLine = this.createOrbitLine(moonData.orbitRadius, moonData.color, 0.18);

        return {
            isMoon: true,
            parentName: parentData.name,
            data: {
                ...moonData,
                type: `${parentData.name} Doğal Uydusu`,
                period: 'Gezegen Yörüngesi',
                realDistance: `${moonData.orbitRadius} km (Ölçekli)`
            },
            root,
            mesh,
            mat,
            orbitLine,
            orbitAngle: mIdx * 2.1
        };
    }

    createOrbitLine(radius, colorHex = '#00e5ff', opacity = 0.24) {
        const segments = 256;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: opacity,
            depthWrite: false
        });
        return new THREE.Line(geo, mat);
    }

    createAsteroidBelt(beltData) {
        const count = beltData.count || 1800;
        const geo = new THREE.DodecahedronGeometry(1, 1);
        const proc = this.textureEngine.generatePlanetTextures('asteroid', 'belt');
        const mat = new THREE.MeshStandardMaterial({
            map: proc.colorMap,
            bumpMap: proc.bumpMap,
            bumpScale: 2.0,
            color: beltData.color || '#9e9589',
            roughness: 0.9
        });

        const instanced = new THREE.InstancedMesh(geo, mat, count);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = beltData.innerRadius + Math.random() * (beltData.outerRadius - beltData.innerRadius);
            const y = (Math.random() - 0.5) * 2800;

            dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            const scale = 35 + Math.pow(Math.random(), 2.2) * 145;
            dummy.scale.set(scale, scale * (0.6 + Math.random() * 0.6), scale);
            dummy.updateMatrix();
            instanced.setMatrixAt(i, dummy.matrix);
        }
        instanced.instanceMatrix.needsUpdate = true;
        return instanced;
    }

    // ========================================================================
    // REAL-TIME ORBITAL MOTION & PROGRESSIVE LOD (LEVEL OF DETAIL)
    // ========================================================================
    updateSystemOrbits(dt) {
        const scaledDt = dt * this.orbitTimeScale;

        // 1. Update Binary/Multiple Stars
        this.starEntries.forEach(star => {
            if (star.data.orbitRadius > 0) {
                star.orbitAngle += (star.data.orbitSpeed || 0.005) * scaledDt;
                star.root.position.set(
                    Math.cos(star.orbitAngle) * star.data.orbitRadius,
                    0,
                    Math.sin(star.orbitAngle) * star.data.orbitRadius
                );
            }
            if (star.mesh) {
                star.mesh.rotation.y += (star.data.rotationSpeed || 0.02) * dt;
            }
        });

        // 2. Rotate Asteroid Belts slowly
        if (this.asteroidBeltMesh) {
            this.asteroidBeltMesh.rotation.y += 0.0012 * scaledDt;
        }
        if (this.kuiperBeltMesh) {
            this.kuiperBeltMesh.rotation.y += 0.0005 * scaledDt;
        }

        // 3. Update Planets, Moons & Progressive Surface Detail (LOD)
        const camPos = this.camera.position;

        this.planetEntries.forEach(planet => {
            // Orbital revolution around star
            planet.orbitAngle += (planet.data.orbitSpeed || 0.01) * scaledDt;
            planet.root.position.set(
                Math.cos(planet.orbitAngle) * planet.data.orbitRadius,
                0,
                Math.sin(planet.orbitAngle) * planet.data.orbitRadius
            );

            // Axial rotation
            planet.mesh.rotation.y += (planet.data.rotationSpeed || 0.02) * dt * 5.0;
            if (planet.detailMesh) {
                planet.detailMesh.rotation.y = planet.mesh.rotation.y;
            }
            if (planet.cloudMesh) {
                planet.cloudMesh.rotation.y += (planet.data.rotationSpeed || 0.02) * dt * 6.8;
            }

            // Update Moons
            planet.moons.forEach(moon => {
                moon.orbitAngle += (moon.data.orbitSpeed || 0.06) * scaledDt;
                moon.root.position.set(
                    Math.cos(moon.orbitAngle) * moon.data.orbitRadius,
                    0,
                    Math.sin(moon.orbitAngle) * moon.data.orbitRadius
                );
                moon.mesh.rotation.y += 0.05 * dt;
            });

            // PROGRESSIVE LOD CALCULATION BASED ON CAMERA DISTANCE
            const dist = camPos.distanceTo(planet.root.position);
            const surfaceDist = Math.max(1, dist - planet.data.radius);
            const ratio = surfaceDist / planet.data.radius;

            // Calculate continuous LOD percentage (10% at deep space -> 100% in low orbit)
            const lodPct = Math.round(Math.max(10, Math.min(100, (1 - Math.min(1, ratio / 35)) * 90 + 10)));
            planet.lodPercent = lodPct;

            if (ratio < 8) {
                // Ultra-Close Approach (LOD 3): 96x96 Sphere + High-Frequency Micro-Relief Overlay
                if (planet.currentLodLevel !== 3) {
                    planet.mesh.geometry = this.geoHigh;
                    planet.currentLodLevel = 3;
                }
                planet.detailMesh.visible = true;
                const detailAlpha = Math.min(0.65, (1.0 - ratio / 8.0) * 0.75);
                planet.detailMat.opacity = detailAlpha;
                planet.mat.bumpScale = 6.5 + (1.0 - ratio / 8.0) * 8.0;
            } else if (ratio < 28) {
                // Medium Approach (LOD 2): 96x96 Sphere + Enhanced Bump
                if (planet.currentLodLevel !== 2) {
                    planet.mesh.geometry = this.geoHigh;
                    planet.currentLodLevel = 2;
                }
                planet.detailMesh.visible = false;
                planet.mat.bumpScale = 4.0;
            } else {
                // Distant View (LOD 1): 48x48 Sphere
                if (planet.currentLodLevel !== 1) {
                    planet.mesh.geometry = this.geoMed;
                    planet.currentLodLevel = 1;
                }
                planet.detailMesh.visible = false;
                planet.mat.bumpScale = 2.0;
            }
        });

        // If spacecraft is locked to a moving planet/moon's orbit, move spacecraft with the body!
        if (this.lockedOrbitTarget) {
            this.lockedOrbitTarget.root.getWorldPosition(this.tmpVec1);
            const deltaMove = this.tmpVec1.clone().sub(this.lastLockedWorldPos);
            this.camera.position.add(deltaMove);
            this.lastLockedWorldPos.copy(this.tmpVec1);
        }
    }

    // ========================================================================
    // 360° QUATERNION 6-DOF FLIGHT CONTROLLER & AUTOPILOT
    // ========================================================================
    initControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyO') this.toggleOrbits();
            if (e.code === 'KeyM') this.toggleGalaxyModal();
            if (e.code === 'Digit1') this.setDriveMode(0.2);
            if (e.code === 'Digit2') this.setDriveMode(1.0);
            if (e.code === 'Digit3') this.setDriveMode(4.0);
            if (e.code === 'Digit4') this.setDriveMode(20.0);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Pointer Lock or Drag on Canvas for 360° Free Look
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.lastMouse.x = e.clientX;
                this.lastMouse.y = e.clientY;
            }
        });

        this.canvas.addEventListener('dblclick', () => {
            if (!document.pointerLockElement) {
                this.canvas.requestPointerLock();
            } else {
                document.exitPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = (document.pointerLockElement === this.canvas);
            const hint = document.getElementById('pointer-lock-hint');
            if (hint) {
                hint.style.opacity = this.isPointerLocked ? '0' : '1';
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked && !this.isDragging) return;

            const dx = this.isPointerLocked ? e.movementX : (e.clientX - this.lastMouse.x);
            const dy = this.isPointerLocked ? e.movementY : (e.clientY - this.lastMouse.y);
            this.lastMouse.x = e.clientX;
            this.lastMouse.y = e.clientY;

            const sensitivity = 0.0022;
            this.rotateShipLocal(-dy * sensitivity, -dx * sensitivity, 0);
        });

        // Mouse wheel adjusts fine speed factor
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1.15 : 0.87;
            this.fineSpeedFactor = Math.max(0.1, Math.min(10.0, this.fineSpeedFactor * delta));
        }, { passive: false });
    }

    // Quaternion local rotation guarantees full 360° pitch, yaw, and roll with zero gimbal lock!
    rotateShipLocal(pitchDelta, yawDelta, rollDelta) {
        if (pitchDelta !== 0) {
            this.tmpQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitchDelta);
            this.camera.quaternion.multiply(this.tmpQuat);
        }
        if (yawDelta !== 0) {
            this.tmpQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yawDelta);
            this.camera.quaternion.multiply(this.tmpQuat);
        }
        if (rollDelta !== 0) {
            this.tmpQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollDelta);
            this.camera.quaternion.multiply(this.tmpQuat);
        }
        this.camera.quaternion.normalize();
    }

    updateFlightPhysics(dt) {
        // 1. Roll controls (Q / E) for 360° axial roll
        let rollInput = 0;
        if (this.keys['KeyQ']) rollInput += 1.4;
        if (this.keys['KeyE']) rollInput -= 1.4;
        if (rollInput !== 0) {
            this.rotateShipLocal(0, 0, rollInput * dt);
        }

        // 2. Check manual thrust inputs
        let forwardInput = 0;
        let rightInput = 0;
        let upInput = 0;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) forwardInput += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) forwardInput -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) rightInput += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) rightInput -= 1;
        if (this.keys['Space'] || this.keys['KeyR']) upInput += 1;
        if (this.keys['ControlLeft'] || this.keys['KeyF']) upInput -= 1;

        const hasManualThrust = (forwardInput !== 0 || rightInput !== 0 || upInput !== 0);
        if (hasManualThrust && this.autopilotActive) {
            // Manual thrust overrides autopilot
            this.autopilotActive = false;
            this.updateAutopilotButtonUI();
        }

        const shiftBoost = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? 2.8 : 1.0;
        const targetMaxSpeed = this.baseCruiseSpeed * this.driveMultiplier * this.fineSpeedFactor * shiftBoost;

        if (this.autopilotActive && this.selectedTarget) {
            // AUTOPILOT NAVIGATION TOWARD TARGET
            this.selectedTarget.root.getWorldPosition(this.tmpVec1);
            const toTarget = this.tmpVec1.clone().sub(this.camera.position);
            const dist = toTarget.length();
            const safeStopDist = this.selectedTarget.data.radius * 2.8;

            if (dist <= safeStopDist) {
                // Arrived at target orbit! Automatically lock orbital velocity
                this.autopilotActive = false;
                this.velocity.set(0, 0, 0);
                this.lockOrbitToSelected();
                this.updateAutopilotButtonUI();
            } else {
                // Smoothly rotate ship to face the target
                const lookMat = new THREE.Matrix4().lookAt(this.camera.position, this.tmpVec1, this.camera.up);
                this.tmpQuat.setFromRotationMatrix(lookMat);
                this.camera.quaternion.slerp(this.tmpQuat, Math.min(1.0, dt * 3.5));

                // Smooth deceleration as we enter close approach (last 10 seconds of flight)
                const approachSlowdown = Math.min(1.0, (dist - safeStopDist) / (targetMaxSpeed * 4.5));
                const desiredSpeed = Math.max(45, targetMaxSpeed * Math.max(0.15, approachSlowdown));
                const dir = toTarget.normalize();
                this.velocity.lerp(dir.multiplyScalar(desiredSpeed), Math.min(1.0, dt * 4.0));
            }
        } else {
            // MANUAL 6-DOF SPACECRAFT THRUST
            const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);

            const desiredVel = new THREE.Vector3();
            desiredVel.addScaledVector(forwardDir, forwardInput * targetMaxSpeed);
            desiredVel.addScaledVector(rightDir, rightInput * targetMaxSpeed * 0.75);
            desiredVel.addScaledVector(upDir, upInput * targetMaxSpeed * 0.75);

            // Smooth inertial damping
            const damping = hasManualThrust ? 3.8 : 2.6;
            this.velocity.lerp(desiredVel, Math.min(1.0, dt * damping));
            if (!hasManualThrust && this.velocity.lengthSq() < 0.5) {
                this.velocity.set(0, 0, 0);
            }
        }

        // Prevent flying inside solid planetary/stellar cores
        this.camera.position.addScaledVector(this.velocity, dt);
        this.celestialObjects.forEach(obj => {
            obj.root.getWorldPosition(this.tmpVec2);
            const d = this.camera.position.distanceTo(this.tmpVec2);
            const minSurface = obj.data.radius * 1.12;
            if (d < minSurface) {
                const pushOut = this.camera.position.clone().sub(this.tmpVec2).normalize().multiplyScalar(minSurface);
                this.camera.position.copy(this.tmpVec2).add(pushOut);
            }
        });
    }

    // ========================================================================
    // UI INITIALIZATION & LIVE TELEMETRY UPDATES
    // ========================================================================
    initUI() {
        // Set Version Stamp in Main Menu per user rules
        const verEl = document.getElementById('app-version-display');
        if (verEl) verEl.textContent = window.APP_VERSION;

        // Populate Main Menu Start System Cards
        const startList = document.getElementById('menu-system-list');
        if (startList) {
            startList.innerHTML = '';
            window.SPACE_DATA.galaxies.forEach(gal => {
                gal.systems.forEach(sys => {
                    const btn = document.createElement('button');
                    btn.className = 'start-system-btn' + (sys.id === 'solar_system' ? ' active' : '');
                    btn.innerHTML = `
                        <span class="sys-galaxy">${gal.name}</span>
                        <span class="sys-name">${sys.name}</span>
                        <span class="sys-desc">${sys.subtitle}</span>
                    `;
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.start-system-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.loadStarSystem(gal.id, sys.id);
                    });
                    startList.appendChild(btn);
                });
            });
        }

        // Launch Button
        document.getElementById('btn-launch').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
        });

        // Open Main Menu Button from HUD
        document.getElementById('btn-open-menu').addEventListener('click', () => {
            if (document.pointerLockElement) document.exitPointerLock();
            document.getElementById('main-menu').classList.remove('hidden');
        });

        // Toggle Orbits
        document.getElementById('btn-toggle-orbits').addEventListener('click', () => this.toggleOrbits());

        // Galaxy Map Modal
        document.getElementById('btn-open-galaxy-map').addEventListener('click', () => this.toggleGalaxyModal(true));
        document.getElementById('btn-close-galaxy-map').addEventListener('click', () => this.toggleGalaxyModal(false));

        // Target Actions (Autopilot & Orbit Lock)
        document.getElementById('btn-autopilot').addEventListener('click', () => {
            if (!this.selectedTarget) return;
            this.autopilotActive = !this.autopilotActive;
            if (this.autopilotActive) {
                this.lockedOrbitTarget = null;
            }
            this.updateAutopilotButtonUI();
        });

        document.getElementById('btn-lock-orbit').addEventListener('click', () => {
            this.lockOrbitToSelected();
        });

        // Drive Mode Buttons
        document.querySelectorAll('.drive-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mult = parseFloat(btn.getAttribute('data-mult'));
                this.setDriveMode(mult);
            });
        });

        // Orbit Time-Scale Slider
        const orbitSlider = document.getElementById('orbit-speed-slider');
        const orbitValLabel = document.getElementById('orbit-speed-val');
        if (orbitSlider) {
            orbitSlider.addEventListener('input', (e) => {
                this.orbitTimeScale = parseFloat(e.target.value);
                if (orbitValLabel) orbitValLabel.textContent = `${this.orbitTimeScale.toFixed(1)}x`;
            });
        }

        this.buildGalaxyModalContent();
    }

    setDriveMode(multiplier) {
        this.driveMultiplier = multiplier;
        this.fineSpeedFactor = 1.0;
        document.querySelectorAll('.drive-btn').forEach(btn => {
            const m = parseFloat(btn.getAttribute('data-mult'));
            btn.classList.toggle('active', Math.abs(m - multiplier) < 0.01);
        });
    }

    toggleOrbits() {
        this.showOrbits = !this.showOrbits;
        this.orbitLines.forEach(line => (line.visible = this.showOrbits));
        this.planetEntries.forEach(p => {
            p.moons.forEach(m => (m.orbitLine.visible = this.showOrbits));
        });
        const btn = document.getElementById('btn-toggle-orbits');
        if (btn) btn.classList.toggle('active', this.showOrbits);
    }

    lockOrbitToSelected() {
        if (!this.selectedTarget) return;
        if (this.lockedOrbitTarget === this.selectedTarget) {
            this.lockedOrbitTarget = null;
        } else {
            this.lockedOrbitTarget = this.selectedTarget;
            this.lockedOrbitTarget.root.getWorldPosition(this.lastLockedWorldPos);
        }
        const btn = document.getElementById('btn-lock-orbit');
        if (btn) {
            btn.textContent = this.lockedOrbitTarget ? 'Yörünge Kilidi: AÇIK' : 'Yörüngeye Kenetlen';
            btn.classList.toggle('active', !!this.lockedOrbitTarget);
        }
    }

    updateAutopilotButtonUI() {
        const btn = document.getElementById('btn-autopilot');
        if (btn) {
            btn.textContent = this.autopilotActive ? 'Otopilot: UÇUŞTA (İptal)' : 'Rotaya Uç (Otopilot)';
        }
    }

    buildGalaxyModalContent() {
        const tabsContainer = document.getElementById('galaxy-tabs-container');
        const gridContainer = document.getElementById('galaxy-systems-grid');
        if (!tabsContainer || !gridContainer) return;

        const renderGalaxySystems = (galaxy) => {
            tabsContainer.querySelectorAll('.galaxy-tab').forEach(t => {
                t.classList.toggle('active', t.getAttribute('data-gal') === galaxy.id);
            });
            gridContainer.innerHTML = '';

            galaxy.systems.forEach(sys => {
                const card = document.createElement('div');
                card.className = 'system-card';
                card.innerHTML = `
                    <div>
                        <div style="font-size:11px; color:var(--accent); font-family:var(--font-display);">${sys.starType} • ${sys.distance}</div>
                        <h3 style="font-family:var(--font-display); font-size:16px; margin:4px 0; color:#fff;">${sys.name}</h3>
                        <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">${sys.description}</p>
                        <div style="margin-top:8px; font-size:11px; color:var(--primary);">
                            Gezegen Sayısı: <strong>${sys.bodies.length}</strong> | Yıldız: <strong>${sys.stars.length}</strong>
                        </div>
                    </div>
                    <button class="action-btn" style="width:100%;">Bu Yıldız Sistemine Warp Yap</button>
                `;
                card.querySelector('button').addEventListener('click', () => {
                    this.loadStarSystem(galaxy.id, sys.id);
                    this.toggleGalaxyModal(false);
                });
                gridContainer.appendChild(card);
            });
        };

        tabsContainer.innerHTML = '';
        window.SPACE_DATA.galaxies.forEach(gal => {
            const tab = document.createElement('button');
            tab.className = 'galaxy-tab';
            tab.setAttribute('data-gal', gal.id);
            tab.textContent = gal.name;
            tab.addEventListener('click', () => renderGalaxySystems(gal));
            tabsContainer.appendChild(tab);
        });

        renderGalaxySystems(this.currentGalaxy);
    }

    toggleGalaxyModal(forceState) {
        const modal = document.getElementById('galaxy-modal');
        if (!modal) return;
        const willShow = typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
        if (willShow && document.pointerLockElement) {
            document.exitPointerLock();
        }
        modal.classList.toggle('hidden', !willShow);
    }

    refreshHUDSystemInfo() {
        document.getElementById('hud-galaxy-name').textContent = this.currentGalaxy.name;
        document.getElementById('hud-system-name').textContent = this.currentSystem.name;

        const listEl = document.getElementById('hud-body-list');
        listEl.innerHTML = '';

        this.celestialObjects.forEach(obj => {
            const item = document.createElement('div');
            item.className = 'body-item' + (this.selectedTarget === obj ? ' selected' : '');
            item.setAttribute('data-body-id', obj.data.id);

            const prefix = obj.isMoon ? '↳ ' : (obj.isStar ? '★ ' : '');
            item.innerHTML = `
                <div class="body-item-left">
                    <span class="body-dot" style="background:${obj.data.color}; color:${obj.data.color};"></span>
                    <div>
                        <div class="body-name">${prefix}${obj.data.name}</div>
                        <div class="body-type-tag">${obj.data.type}</div>
                    </div>
                </div>
                <span class="body-dist" id="dist-label-${obj.data.id}">--</span>
            `;
            item.addEventListener('click', () => {
                this.selectTarget(obj);
            });
            listEl.appendChild(item);
        });
    }

    selectTarget(targetObj) {
        this.selectedTarget = targetObj;
        document.querySelectorAll('.body-item').forEach(el => {
            el.classList.toggle('selected', el.getAttribute('data-body-id') === targetObj.data.id);
        });

        const d = targetObj.data;
        document.getElementById('target-name').textContent = d.name;
        document.getElementById('target-type').textContent = d.type;
        document.getElementById('target-desc').textContent = d.description;
        document.getElementById('target-temp').textContent = d.temperature || 'Bilinmiyor';
        document.getElementById('target-period').textContent = d.period || '-';
        document.getElementById('target-real-dist').textContent = d.realDistance || '-';

        const lockBtn = document.getElementById('btn-lock-orbit');
        if (lockBtn) {
            lockBtn.textContent = (this.lockedOrbitTarget === targetObj) ? 'Yörünge Kilidi: AÇIK' : 'Yörüngeye Kenetlen';
            lockBtn.classList.toggle('active', this.lockedOrbitTarget === targetObj);
        }
    }

    updateHUDTelemetry() {
        const camPos = this.camera.position;

        // 1. Update Coordinates & 360° Attitude Angles
        document.getElementById('hud-coords').textContent =
            `X: ${(camPos.x / 1000).toFixed(1)}k  Y: ${(camPos.y / 1000).toFixed(1)}k  Z: ${(camPos.z / 1000).toFixed(1)}k`;

        this.eulerOrder.setFromQuaternion(this.camera.quaternion, 'YXZ');
        const yawDeg = ((THREE.MathUtils.radToDeg(-this.eulerOrder.y) % 360) + 360) % 360;
        const pitchDeg = THREE.MathUtils.radToDeg(this.eulerOrder.x);
        const rollDeg = THREE.MathUtils.radToDeg(this.eulerOrder.z);

        document.getElementById('hud-heading').textContent = `YÖN (YAW): ${yawDeg.toFixed(0).padStart(3, '0')}°`;
        document.getElementById('hud-pitch').textContent = `EĞİM (PITCH): ${pitchDeg.toFixed(0)}°`;
        document.getElementById('hud-roll').textContent = `YATIŞ (ROLL): ${rollDeg.toFixed(0)}°`;

        // 2. Update Distances in Left Navigation List
        this.celestialObjects.forEach(obj => {
            obj.root.getWorldPosition(this.tmpVec1);
            const dist = Math.max(0, camPos.distanceTo(this.tmpVec1) - obj.data.radius);
            const label = document.getElementById(`dist-label-${obj.data.id}`);
            if (label) {
                label.textContent = dist > 10000
                    ? `${(dist / 1000).toFixed(1)}k u`
                    : `${Math.round(dist)} u`;
            }
        });

        // 3. Update Speed, ETA (~1 min between planets at Cruise Speed) & Target LOD
        const currentSpeed = this.velocity.length();
        const configuredSpeed = this.baseCruiseSpeed * this.driveMultiplier * this.fineSpeedFactor;
        const displaySpeed = currentSpeed > 2 ? currentSpeed : configuredSpeed;
        document.getElementById('hud-speed-val').textContent = `${Math.round(displaySpeed).toLocaleString('tr-TR')} u/sn`;

        const marker = document.getElementById('target-marker');

        if (this.selectedTarget) {
            this.selectedTarget.root.getWorldPosition(this.tmpVec1);
            const rawDist = camPos.distanceTo(this.tmpVec1);
            const surfDist = Math.max(0, rawDist - this.selectedTarget.data.radius);

            document.getElementById('target-live-dist').textContent = `${Math.round(surfDist).toLocaleString('tr-TR')} birim`;

            // Calculate ETA at current/configured cruise speed
            const effectiveSpeed = Math.max(displaySpeed, 1);
            const etaSec = Math.round(surfDist / effectiveSpeed);
            const mins = Math.floor(etaSec / 60);
            const secs = etaSec % 60;
            const etaText = mins > 0 ? `~${mins} dk ${secs} sn` : `~${secs} saniye`;
            document.getElementById('hud-eta-val').textContent = `Hedefe Varış (ETA): ${etaText}`;

            // Update Progressive LOD bar
            const lodPct = this.selectedTarget.lodPercent || (surfDist < 5000 ? 95 : 35);
            document.getElementById('lod-percent-val').textContent = `%${lodPct} (${lodPct > 80 ? 'Ultra Yüzey Detayı' : lodPct > 45 ? 'Orta Yörünge' : 'Uzak Gözlem'})`;
            document.getElementById('lod-bar-fill').style.width = `${lodPct}%`;

            // Project 3D target onto 2D screen for HUD Target Marker
            const proj = this.tmpVec1.clone().project(this.camera);
            if (proj.z < 1.0 && surfDist > this.selectedTarget.data.radius * 3) {
                const sx = (proj.x * 0.5 + 0.5) * window.innerWidth;
                const sy = (-proj.y * 0.5 + 0.5) * window.innerHeight;
                marker.style.display = 'block';
                marker.style.left = `${sx}px`;
                marker.style.top = `${sy}px`;
                marker.setAttribute('data-label', `${this.selectedTarget.data.name} (${etaText})`);
            } else {
                marker.style.display = 'none';
            }
        }
    }

    // ========================================================================
    // MAIN RENDER LOOP
    // ========================================================================
    animate() {
        requestAnimationFrame(this.animate);

        const dt = Math.min(this.clock.getDelta(), 0.1);

        // Keep deep-space background centered on camera so stars are infinitely distant
        this.backgroundGroup.position.copy(this.camera.position);

        this.updateSystemOrbits(dt);
        this.updateFlightPhysics(dt);
        this.updateHUDTelemetry();

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.cosmosApp = new CosmosSimulator();
});
