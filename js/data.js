// ============================================================================
// COSMOS 3D - ASTRONOMICAL DATABASE (GALAXIES, STAR SYSTEMS & CELESTIAL BODIES)
// ============================================================================
// Distance Calibration:
// Neighboring inner planets are ~18,000 - 24,000 units apart.
// At Default Cruise Speed (360 u/s), flying between neighboring planets takes ~55-65 seconds (~1 minute).

window.APP_VERSION = "v1.1.0 - 2026-10-19 23:15";

window.SPACE_DATA = {
    cruiseSpeedDefault: 360, // ~60 seconds for 21,600 units interplanetary flight
    galaxies: [
        {
            id: "milky_way",
            name: "Samanyolu Galaksisi (Milky Way)",
            type: "Çubuklu Sarmal Galaksi (SBbc)",
            diameter: "105.700 Işık Yılı",
            distanceFromEarth: "0 Işık Yılı (Evimiz)",
            skyTint: { r: 0.04, g: 0.08, b: 0.18 },
            nebulaColors: ["#0077ff", "#7b2cbf", "#00f5d4"],
            description: "Güneş Sistemimizi ve 200-400 milyar yıldızı barındıran, Orion Kolu'nda yer aldığımız devasa çubuklu sarmal galaksi.",
            systems: [
                {
                    id: "solar_system",
                    name: "Güneş Sistemi (Sol)",
                    subtitle: "En Detaylı Bilinen Gezegen Sistemi",
                    starType: "G2V Sarı Cüce Yıldız",
                    distance: "0 Işık Yılı",
                    description: "Merkür'den Plüton'a, Asteroit Kuşağı'ndan doğal uydulara kadar yüksek çözünürlüklü dokular, atmosfer katmanları ve halkalarla modellenmiş evimiz.",
                    asteroidBelt: {
                        innerRadius: 96000,
                        outerRadius: 112000,
                        count: 2200,
                        color: "#9e9589"
                    },
                    kuiperBelt: {
                        innerRadius: 248000,
                        outerRadius: 272000,
                        count: 1400,
                        color: "#7c98b3"
                    },
                    stars: [
                        {
                            id: "sun",
                            name: "Güneş (Sol)",
                            role: "Merkez Yıldız (G2V)",
                            radius: 5200,
                            orbitRadius: 0,
                            orbitSpeed: 0,
                            rotationSpeed: 0.04,
                            color: "#ffaa00",
                            coronaColor: "#ff5500",
                            lightColor: "#fff6e5",
                            temperature: "5.778 K",
                            mass: "1,989 × 10³⁰ kg",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Map_of_the_full_sun.jpg",
                            proceduralType: "star_yellow",
                            description: "Güneş Sistemi'nin kütlesinin %99,86'sını oluşturan, çekirdeğinde nükleer füzyonla saniyede 600 milyon ton hidrojeni helyuma dönüştüren plazma küresi."
                        }
                    ],
                    bodies: [
                        {
                            id: "mercury",
                            name: "Merkür",
                            type: "Karasal Gezegen",
                            radius: 420,
                            orbitRadius: 18000,
                            orbitSpeed: 0.018,
                            rotationSpeed: 0.004,
                            tilt: 0.03,
                            color: "#a8a29e",
                            atmosphereColor: null,
                            temperature: "-173°C / +427°C",
                            period: "88 Dünya Günü",
                            realDistance: "57,9 Milyon km (0.39 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_in_color_-_Prockter07_centered.jpg",
                            proceduralType: "mercury",
                            description: "Güneş'e en yakın ve en küçük gezegen. Caloris Havzası dahil binlerce kraterle kaplı antik yüzeyi ve devasa demir çekirdeğiyle bilinir.",
                            moons: []
                        },
                        {
                            id: "venus",
                            name: "Venüs",
                            type: "Karasal Gezegen",
                            radius: 780,
                            orbitRadius: 36000,
                            orbitSpeed: 0.013,
                            rotationSpeed: -0.002,
                            tilt: 3.09,
                            color: "#eab308",
                            atmosphereColor: "#facc15",
                            atmosphereOpacity: 0.48,
                            temperature: "+462°C (Sera Etkisi)",
                            period: "225 Dünya Günü",
                            realDistance: "108,2 Milyon km (0.72 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_2k_venus_surface.jpg",
                            cloudTextureUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
                            proceduralType: "venus",
                            description: "Yoğun karbondioksit atmosferi ve sülfürik asit bulutlarıyla kaplı, Güneş Sistemi'nin en sıcak gezegeni. Kendi ekseni etrafında ters yönde döner.",
                            moons: []
                        },
                        {
                            id: "earth",
                            name: "Dünya (Terra)",
                            type: "Yaşama Elverişli Karasal Gezegen",
                            radius: 850,
                            orbitRadius: 58000,
                            orbitSpeed: 0.010,
                            rotationSpeed: 0.025,
                            tilt: 0.41,
                            color: "#2563eb",
                            atmosphereColor: "#38bdf8",
                            atmosphereOpacity: 0.42,
                            hasClouds: true,
                            hasCityLights: true,
                            temperature: "Ortalama +15°C",
                            period: "365.25 Gün",
                            realDistance: "149,6 Milyon km (1.00 AU)",
                            textureUrl: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
                            specularUrl: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg",
                            normalUrl: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg",
                            cloudTextureUrl: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png",
                            proceduralType: "earth",
                            description: "Okyanusları, dinamik bulut katmanları, Rayleigh atmosferik saçılımı ve kıtasal levha tektoniğiyle evrende yaşam barındırdığı bilinen tek gezegen.",
                            moons: [
                                {
                                    id: "moon",
                                    name: "Ay (Luna)",
                                    radius: 230,
                                    orbitRadius: 2600,
                                    orbitSpeed: 0.075,
                                    color: "#d4d4d8",
                                    textureUrl: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg",
                                    proceduralType: "moon",
                                    description: "Dünya'nın tek doğal uydusu. Bazaltik denizleri (Maria) ve Highlands kraterleriyle gelgitleri dengeler."
                                }
                            ]
                        },
                        {
                            id: "mars",
                            name: "Mars",
                            type: "Karasal Gezegen",
                            radius: 560,
                            orbitRadius: 80000,
                            orbitSpeed: 0.008,
                            rotationSpeed: 0.024,
                            tilt: 0.44,
                            color: "#ea580c",
                            atmosphereColor: "#fb923c",
                            atmosphereOpacity: 0.24,
                            temperature: "-63°C Ortalama",
                            period: "687 Dünya Günü",
                            realDistance: "227,9 Milyon km (1.52 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
                            proceduralType: "mars",
                            description: "Demir oksit tozlarıyla Kızıl Gezegen olarak bilinen Mars; Güneş Sistemi'nin en yüksek yanardağı Olympus Mons ve Valles Marineris kanyonuna ev sahipliği yapar.",
                            moons: [
                                {
                                    id: "phobos",
                                    name: "Phobos",
                                    radius: 65,
                                    orbitRadius: 1350,
                                    orbitSpeed: 0.14,
                                    color: "#a89f91",
                                    proceduralType: "asteroid",
                                    description: "Mars'a çok yakın yörüngede dönen, Stickney krateriyle ünlü düzensiz şekilli iç uydu."
                                },
                                {
                                    id: "deimos",
                                    name: "Deimos",
                                    radius: 48,
                                    orbitRadius: 1950,
                                    orbitSpeed: 0.09,
                                    color: "#b8b0a4",
                                    proceduralType: "asteroid",
                                    description: "Mars'ın daha dış yörüngedeki küçük ve pürüzsüz yüzeyli ikinci uydusu."
                                }
                            ]
                        },
                        {
                            id: "ceres",
                            name: "Ceres (Asteroit Kuşağı)",
                            type: "Cüce Gezegen",
                            radius: 260,
                            orbitRadius: 104000,
                            orbitSpeed: 0.0065,
                            rotationSpeed: 0.04,
                            tilt: 0.07,
                            color: "#9ca3af",
                            temperature: "-105°C",
                            period: "4.6 Yıl",
                            realDistance: "413 Milyon km (2.77 AU)",
                            proceduralType: "mercury",
                            description: "Mars ve Jüpiter arasındaki Ana Asteroit Kuşağı'nda yer alan en büyük gök cismi ve cüce gezegen. Occator kraterindeki parlak tuz yataklarıyla tanınır.",
                            moons: []
                        },
                        {
                            id: "jupiter",
                            name: "Jüpiter",
                            type: "Gaz Devi",
                            radius: 2150,
                            orbitRadius: 132000,
                            orbitSpeed: 0.0052,
                            rotationSpeed: 0.055,
                            tilt: 0.05,
                            color: "#d97706",
                            atmosphereColor: "#fcd34d",
                            atmosphereOpacity: 0.25,
                            temperature: "-110°C",
                            period: "11.86 Yıl",
                            realDistance: "778,5 Milyon km (5.20 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",
                            proceduralType: "jupiter",
                            rings: {
                                innerRadius: 2450,
                                outerRadius: 3100,
                                color: "#a1887f",
                                opacity: 0.14
                            },
                            description: "Güneş Sistemi'nin en büyük gezegeni. Amonyak kristallerinden oluşan turbulent kuşakları, asırlardır süren Büyük Kırmızı Leke fırtınası ve 95 uydusuyla devasa bir sistemdir.",
                            moons: [
                                {
                                    id: "io",
                                    name: "Io",
                                    radius: 210,
                                    orbitRadius: 3500,
                                    orbitSpeed: 0.11,
                                    color: "#facc15",
                                    proceduralType: "io",
                                    description: "Güneş Sistemi'ndeki jeolojik olarak en aktif, yüzlerce aktif kükürt volkanına sahip uydu."
                                },
                                {
                                    id: "europa",
                                    name: "Europa",
                                    radius: 195,
                                    orbitRadius: 4300,
                                    orbitSpeed: 0.085,
                                    color: "#e0f2fe",
                                    proceduralType: "ice",
                                    description: "Çatlaklı buz kabuğunun altında devasa bir tuzlu su okyanusu barındıran, yaşam adaylarından biri."
                                },
                                {
                                    id: "ganymede",
                                    name: "Ganymede",
                                    radius: 290,
                                    orbitRadius: 5300,
                                    orbitSpeed: 0.06,
                                    color: "#a1a1aa",
                                    proceduralType: "moon",
                                    description: "Güneş Sistemi'nin en büyük uydusu (Merkür'den bile büyüktür) ve kendi manyetosferine sahip tek uydu."
                                },
                                {
                                    id: "callisto",
                                    name: "Callisto",
                                    radius: 265,
                                    orbitRadius: 6500,
                                    orbitSpeed: 0.042,
                                    color: "#71717a",
                                    proceduralType: "mercury",
                                    description: "Valhalla çok halkalı çarpışma havzasıyla kaplı, Güneş Sistemi'nin en yaşlı yüzeylerinden biri."
                                }
                            ]
                        },
                        {
                            id: "saturn",
                            name: "Satürn",
                            type: "Halkalı Gaz Devi",
                            radius: 1820,
                            orbitRadius: 168000,
                            orbitSpeed: 0.0038,
                            rotationSpeed: 0.05,
                            tilt: 0.46,
                            color: "#fde047",
                            atmosphereColor: "#fef08a",
                            atmosphereOpacity: 0.22,
                            temperature: "-140°C",
                            period: "29.45 Yıl",
                            realDistance: "1,43 Milyar km (9.58 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Saturn_%28planet%29_large.jpg",
                            proceduralType: "saturn",
                            rings: {
                                innerRadius: 2350,
                                outerRadius: 4650,
                                color: "#e7d3b0",
                                opacity: 0.88,
                                detailBands: true
                            },
                            description: "Milyarlarca buz ve kaya parçasından oluşan muazzam halka sistemi, kuzey kutbundaki altıgen fırtınası ve Titan uydusuyla Güneş Sistemi'nin mücevheri.",
                            moons: [
                                {
                                    id: "enceladus",
                                    name: "Enceladus",
                                    radius: 140,
                                    orbitRadius: 5100,
                                    orbitSpeed: 0.095,
                                    color: "#f8fafc",
                                    proceduralType: "ice",
                                    description: "Güney kutbundaki gayzerlerden uzaya su buharı ve buz kristalleri püskürten parlak buz uydusu."
                                },
                                {
                                    id: "titan",
                                    name: "Titan",
                                    radius: 280,
                                    orbitRadius: 6400,
                                    orbitSpeed: 0.055,
                                    color: "#f59e0b",
                                    proceduralType: "venus",
                                    description: "Yoğun azot atmosferine ve yüzeyinde sıvı metan/etan denizlerine sahip tek doğal uydu."
                                }
                            ]
                        },
                        {
                            id: "uranus",
                            name: "Uranüs",
                            type: "Buz Devi",
                            radius: 1280,
                            orbitRadius: 202000,
                            orbitSpeed: 0.0027,
                            rotationSpeed: -0.035,
                            tilt: 1.70, // 97.7 degrees sideways!
                            color: "#67e8f9",
                            atmosphereColor: "#22d3ee",
                            atmosphereOpacity: 0.32,
                            temperature: "-195°C",
                            period: "84 Yıl",
                            realDistance: "2,87 Milyar km (19.2 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg",
                            proceduralType: "uranus",
                            rings: {
                                innerRadius: 1650,
                                outerRadius: 2350,
                                color: "#7dd3fc",
                                opacity: 0.42
                            },
                            description: "Yörünge düzlemine neredeyse 98 derece yatık ekseniyle yuvarlanır gibi dönen, metan gazı nedeniyle camgöbeği renginde parlayan soğuk buz devi.",
                            moons: [
                                {
                                    id: "titania",
                                    name: "Titania",
                                    radius: 160,
                                    orbitRadius: 3100,
                                    orbitSpeed: 0.07,
                                    color: "#cbd5e1",
                                    proceduralType: "moon",
                                    description: "Uranüs'ün en büyük uydusu; devasa fay kanyonları ve buzlu kraterlerle kaplıdır."
                                }
                            ]
                        },
                        {
                            id: "neptune",
                            name: "Neptün",
                            type: "Buz Devi",
                            radius: 1240,
                            orbitRadius: 234000,
                            orbitSpeed: 0.0020,
                            rotationSpeed: 0.038,
                            tilt: 0.49,
                            color: "#3b82f6",
                            atmosphereColor: "#60a5fa",
                            atmosphereOpacity: 0.38,
                            temperature: "-200°C",
                            period: "164.8 Yıl",
                            realDistance: "4,50 Milyar km (30.1 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg",
                            proceduralType: "neptune",
                            rings: {
                                innerRadius: 1580,
                                outerRadius: 2100,
                                color: "#60a5fa",
                                opacity: 0.25
                            },
                            description: "Saatte 2.100 km'ye ulaşan süpersonik rüzgarlarıyla Güneş Sistemi'nin en fırtınalı gezegeni. Derin lacivert atmosferi ve sirüs metan bulutlarıyla dikkat çeker.",
                            moons: [
                                {
                                    id: "triton",
                                    name: "Triton",
                                    radius: 215,
                                    orbitRadius: 3100,
                                    orbitSpeed: -0.065,
                                    color: "#f1f5f9",
                                    proceduralType: "ice",
                                    description: "Gezegeninin dönüş yönünün tersine (retrograd) dönen, nitrojen gayzerlerine sahip yakalanmış Kuiper Kuşağı cismi."
                                }
                            ]
                        },
                        {
                            id: "pluto",
                            name: "Plüton & Charon",
                            type: "Kuiper Kuşağı Cüce Gezegeni",
                            radius: 360,
                            orbitRadius: 260000,
                            orbitSpeed: 0.0014,
                            rotationSpeed: 0.008,
                            tilt: 2.13,
                            color: "#d6b89c",
                            atmosphereColor: "#93c5fd",
                            atmosphereOpacity: 0.16,
                            temperature: "-229°C",
                            period: "248 Yıl",
                            realDistance: "5,9 Milyar km (39.5 AU)",
                            textureUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Pluto_in_True_Color_-_High-Res.jpg",
                            proceduralType: "pluto",
                            description: "Kalp şeklindeki nitrojen buzulu Tombaugh Regio (Sputnik Planitia) ve ince mavi puslu atmosferiyle Kuiper Kuşağı'nın kralı.",
                            moons: [
                                {
                                    id: "charon",
                                    name: "Charon",
                                    radius: 185,
                                    orbitRadius: 1200,
                                    orbitSpeed: 0.05,
                                    color: "#9ca3af",
                                    proceduralType: "moon",
                                    description: "Plüton'un yarısı büyüklüğündeki uydusu; ikili birbirine kütleçekimsel olarak kilitlenmiştir."
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "alpha_centauri",
                    name: "Alpha & Proxima Centauri",
                    subtitle: "Güneş'e En Yakın Üçlü Yıldız Sistemi (4.24 IY)",
                    starType: "G2V + K1V Çift Yıldız & M5.5V Kırmızı Cüce",
                    distance: "4,24 Işık Yılı",
                    description: "Güneş'imize en yakın yıldız komşumuz! Birbirleri etrafında dönen parlak Alpha Centauri A ve B yıldızları ile yaşanabilir kuşakta Proxima b gezegenini barındıran Proxima Centauri.",
                    stars: [
                        {
                            id: "alpha_cen_a",
                            name: "Alpha Centauri A (Rigil Kentaurus)",
                            role: "Birincil Yıldız (G2V)",
                            radius: 5400,
                            orbitRadius: 6800,
                            orbitSpeed: 0.006,
                            orbitPhase: 0,
                            color: "#fff3b0",
                            coronaColor: "#ffaa00",
                            lightColor: "#fff8e7",
                            temperature: "5.790 K",
                            mass: "1.10 Güneş Kütlesi",
                            proceduralType: "star_yellow",
                            description: "Güneş ile neredeyse ikiz olan ancak %50 daha parlak parlayan sarı ana kol yıldızı."
                        },
                        {
                            id: "alpha_cen_b",
                            name: "Alpha Centauri B (Toliman)",
                            role: "İkincil Yıldız (K1V)",
                            radius: 4100,
                            orbitRadius: 6800,
                            orbitSpeed: 0.006,
                            orbitPhase: 3.14159,
                            color: "#ff922b",
                            coronaColor: "#ff5500",
                            lightColor: "#ffd8a8",
                            temperature: "5.260 K",
                            mass: "0.90 Güneş Kütlesi",
                            proceduralType: "star_orange",
                            description: "Alpha Centauri A ile ortak kütle merkezi etrafında 79.9 yılda bir dönen turuncu cüce yıldız."
                        }
                    ],
                    bodies: [
                        {
                            id: "candidate_c1",
                            name: "Alpha Centauri Ab (Aday C1)",
                            type: "Sıcak Neptün / Gaz Gezegeni",
                            radius: 1150,
                            orbitRadius: 26000,
                            orbitSpeed: 0.014,
                            rotationSpeed: 0.03,
                            tilt: 0.2,
                            color: "#38bdf8",
                            atmosphereColor: "#7dd3fc",
                            atmosphereOpacity: 0.35,
                            temperature: "+85°C",
                            period: "360 Gün",
                            realDistance: "1.1 AU",
                            proceduralType: "uranus",
                            description: "James Webb ve VLT gözlemleriyle Alpha Centauri A'nın yaşanabilir bölgesinde tespit edilen sıcak gaz devi adayı.",
                            moons: [
                                {
                                    id: "pandora_like",
                                    name: "Polyphemus Aday Uydusu",
                                    radius: 280,
                                    orbitRadius: 2800,
                                    orbitSpeed: 0.08,
                                    color: "#10b981",
                                    proceduralType: "earth",
                                    description: "Çift yıldız ışığı altında biyolüminesan ormanlara ve yoğun atmosfere sahip olabileceği düşünülen egzotik uydu."
                                }
                            ]
                        },
                        {
                            id: "proxima_star_node",
                            name: "Proxima Centauri (C Yıldızı)",
                            type: "Kırmızı Cüce Yıldız (M5.5Ve)",
                            radius: 1950,
                            orbitRadius: 52000,
                            orbitSpeed: 0.004,
                            rotationSpeed: 0.02,
                            tilt: 0.1,
                            color: "#ef4444",
                            atmosphereColor: "#f87171",
                            atmosphereOpacity: 0.55,
                            temperature: "3.042 K",
                            period: "Üçlü Sistem Dış Yörüngesi",
                            realDistance: "4.24 Işık Yılı",
                            proceduralType: "star_red",
                            description: "Güneş'e en yakın tekil yıldız. Düşük kütleli kızılötesi parlamaları olan aktif bir kırmızı cüce.",
                            moons: []
                        },
                        {
                            id: "proxima_b",
                            name: "Proxima Centauri b",
                            type: "Yaşanabilir Kuşak Kayaç Ötegezegen",
                            radius: 890,
                            orbitRadius: 74000,
                            orbitSpeed: 0.011,
                            rotationSpeed: 0.008,
                            tilt: 0.05,
                            color: "#0ea5e9",
                            atmosphereColor: "#fb7185",
                            atmosphereOpacity: 0.38,
                            hasClouds: true,
                            temperature: "-39°C (Denge Sıcaklığı)",
                            period: "11.2 Gün",
                            realDistance: "0.0485 AU",
                            proceduralType: "exoplanet_habitable",
                            description: "Dünya'ya en yakın bilinen ötegezegen! Kızıl bir güneşin altında, gündüz-gece sınır çizgisinde (Terminator kuşağı) sıvı su okyanusları barındırma potansiyeline sahiptir.",
                            moons: []
                        },
                        {
                            id: "proxima_c",
                            name: "Proxima Centauri c",
                            type: "Halkalı Süper-Dünya / Mini-Neptün",
                            radius: 1350,
                            orbitRadius: 98000,
                            orbitSpeed: 0.007,
                            rotationSpeed: 0.03,
                            tilt: 0.35,
                            color: "#818cf8",
                            atmosphereColor: "#a5b4fc",
                            atmosphereOpacity: 0.32,
                            temperature: "-234°C",
                            period: "5.28 Yıl",
                            realDistance: "1.49 AU",
                            proceduralType: "neptune",
                            rings: {
                                innerRadius: 1750,
                                outerRadius: 3200,
                                color: "#c7d2fe",
                                opacity: 0.65,
                                detailBands: true
                            },
                            description: "Dünya'nın 7 katı kütleye sahip, geniş buz halkalarıyla çevrili soğuk dış yörünge süper-Dünyası.",
                            moons: []
                        }
                    ]
                },
                {
                    id: "trappist_1",
                    name: "TRAPPIST-1 Sistemi",
                    subtitle: "7 Kayalık Gezegenli Kompakt Rezonans Sistemi",
                    starType: "M8V Ultra-Soğuk Kırmızı Cüce",
                    distance: "39,46 Işık Yılı (Kova Takımyıldızı)",
                    description: "Jüpiter'den biraz daha büyük ultra-soğuk bir kırmızı cüce etrafında kusursuz harmonik rezonansla dönen 7 Dünya boyutlu gezegen. 3 tanesi doğrudan yaşanabilir su kuşağındadır!",
                    stars: [
                        {
                            id: "trappist_star",
                            name: "TRAPPIST-1A",
                            role: "Ultra-Soğuk Kırmızı Cüce (M8V)",
                            radius: 3800,
                            orbitRadius: 0,
                            orbitSpeed: 0,
                            color: "#ff3b30",
                            coronaColor: "#b91c1c",
                            lightColor: "#ff9e80",
                            temperature: "2.566 K",
                            mass: "0.089 Güneş Kütlesi",
                            proceduralType: "star_red",
                            description: "Trilyonlarca yıl yanmaya devam edecek olan, derin kızıl parıltılı ultra-soğuk cüce yıldız."
                        }
                    ],
                    bodies: [
                        {
                            id: "trappist_b",
                            name: "TRAPPIST-1b",
                            type: "Volkanik Kayalık Gezegen",
                            radius: 820,
                            orbitRadius: 16000,
                            orbitSpeed: 0.022,
                            rotationSpeed: 0.01,
                            tilt: 0.02,
                            color: "#f97316",
                            atmosphereColor: "#ef4444",
                            atmosphereOpacity: 0.25,
                            temperature: "+127°C",
                            period: "1.51 Gün",
                            realDistance: "0.0115 AU",
                            proceduralType: "lava",
                            description: "Yıldızına çok yakın olduğu için gelgit ısınmasıyla sürekli volkanik patlamalar yaşayan kızgın iç gezegen.",
                            moons: []
                        },
                        {
                            id: "trappist_c",
                            name: "TRAPPIST-1c",
                            type: "Yoğun Kayaç Gezegen",
                            radius: 810,
                            orbitRadius: 31000,
                            orbitSpeed: 0.017,
                            rotationSpeed: 0.01,
                            tilt: 0.04,
                            color: "#d97706",
                            temperature: "+69°C",
                            period: "2.42 Gün",
                            realDistance: "0.0158 AU",
                            proceduralType: "venus",
                            description: "JWST ölçümlerine göre ince veya bulutsuz bir atmosfere sahip sıcak kayalık dünya.",
                            moons: []
                        },
                        {
                            id: "trappist_d",
                            name: "TRAPPIST-1d",
                            type: "Alacakaranlık Su Dünyası",
                            radius: 680,
                            orbitRadius: 47000,
                            orbitSpeed: 0.014,
                            rotationSpeed: 0.012,
                            tilt: 0.08,
                            color: "#38bdf8",
                            atmosphereColor: "#7dd3fc",
                            atmosphereOpacity: 0.35,
                            hasClouds: true,
                            temperature: "+15°C",
                            period: "4.05 Gün",
                            realDistance: "0.0222 AU",
                            proceduralType: "exoplanet_habitable",
                            description: "Yaşanabilir bölgenin iç sınırında yer alan, bol su buharı ve ılıman iklime sahip ötegezegen.",
                            moons: []
                        },
                        {
                            id: "trappist_e",
                            name: "TRAPPIST-1e",
                            type: "Birincil Yaşanabilir Okyanus Gezegeni",
                            radius: 790,
                            orbitRadius: 65000,
                            orbitSpeed: 0.011,
                            rotationSpeed: 0.015,
                            tilt: 0.12,
                            color: "#0284c7",
                            atmosphereColor: "#38bdf8",
                            atmosphereOpacity: 0.45,
                            hasClouds: true,
                            temperature: "-22°C (Okyanus Kuşağı +12°C)",
                            period: "6.10 Gün",
                            realDistance: "0.0292 AU",
                            proceduralType: "earth",
                            description: "Demir çekirdeği, Dünya benzeri yoğunluğu ve küresel sıvı su okyanuslarıyla yaşam için en güçlü adaylardan biri!",
                            moons: []
                        },
                        {
                            id: "trappist_f",
                            name: "TRAPPIST-1f",
                            type: "Gözbebekli Su/Buz Dünyası",
                            radius: 860,
                            orbitRadius: 84000,
                            orbitSpeed: 0.0085,
                            rotationSpeed: 0.01,
                            tilt: 0.05,
                            color: "#60a5fa",
                            atmosphereColor: "#93c5fd",
                            atmosphereOpacity: 0.38,
                            temperature: "-54°C",
                            period: "9.20 Gün",
                            realDistance: "0.0385 AU",
                            proceduralType: "ice",
                            description: "Yıldızına bakan yüzünde açık mavi bir okyanus, karanlık yüzünde ise sonsuz buzullara sahip 'Eyeball Earth' tipi gezegen.",
                            moons: []
                        },
                        {
                            id: "trappist_g",
                            name: "TRAPPIST-1g",
                            type: "Buzlu Süper-Dünya",
                            radius: 920,
                            orbitRadius: 103000,
                            orbitSpeed: 0.0068,
                            rotationSpeed: 0.012,
                            tilt: 0.1,
                            color: "#818cf8",
                            atmosphereColor: "#c7d2fe",
                            atmosphereOpacity: 0.3,
                            temperature: "-75°C",
                            period: "12.35 Gün",
                            realDistance: "0.0468 AU",
                            proceduralType: "uranus",
                            description: "Sistemdeki en büyük gezegen; kalın buz kabuğu ve yoğun atmosferle çevrilidir.",
                            moons: []
                        },
                        {
                            id: "trappist_h",
                            name: "TRAPPIST-1h",
                            type: "Dış Yörünge Donmuş Dünya",
                            radius: 640,
                            orbitRadius: 122000,
                            orbitSpeed: 0.005,
                            rotationSpeed: 0.015,
                            tilt: 0.05,
                            color: "#cbd5e1",
                            temperature: "-104°C",
                            period: "18.77 Gün",
                            realDistance: "0.0619 AU",
                            proceduralType: "pluto",
                            description: "TRAPPIST-1 sisteminin en dış sınırında yer alan, kriyovolkanik aktiviteye sahip buzlu dünya.",
                            moons: []
                        }
                    ]
                },
                {
                    id: "kepler_186",
                    name: "Kepler-186 Sistemi",
                    subtitle: "Kızıl Okyanuslar ve Kızıl Bitki Örtüsü Dünyası",
                    starType: "M1V Kırmızı Cüce Yıldız",
                    distance: "582 Işık Yılı (Kuğu Takımyıldızı)",
                    description: "Başka bir yıldızın yaşanabilir bölgesinde keşfedilen Dünya boyutundaki ilk ötegezegen olan Kepler-186f'nin evi.",
                    stars: [
                        {
                            id: "kepler186_star",
                            name: "Kepler-186",
                            role: "Kırmızı Cüce Yıldız (M1V)",
                            radius: 4400,
                            orbitRadius: 0,
                            orbitSpeed: 0,
                            color: "#ff5722",
                            coronaColor: "#d84315",
                            lightColor: "#ffccbc",
                            temperature: "3.755 K",
                            mass: "0.54 Güneş Kütlesi",
                            proceduralType: "star_orange",
                            description: "Güneş'in yarısı kütlesinde, kehribar-kızıl tonlarında ışık yayan sakin bir M1 cücesi."
                        }
                    ],
                    bodies: [
                        {
                            id: "kepler_186b",
                            name: "Kepler-186b",
                            type: "Lav Gezegeni",
                            radius: 780,
                            orbitRadius: 20000,
                            orbitSpeed: 0.019,
                            rotationSpeed: 0.01,
                            tilt: 0.05,
                            color: "#ef4444",
                            proceduralType: "lava",
                            temperature: "+300°C",
                            period: "3.88 Gün",
                            realDistance: "0.034 AU",
                            description: "Yıldızına çok yakın dönen, erimiş silikat nehirleriyle kaplı kayalık dünya.",
                            moons: []
                        },
                        {
                            id: "kepler_186e",
                            name: "Kepler-186e",
                            type: "Sıcak Süper-Dünya",
                            radius: 920,
                            orbitRadius: 42000,
                            orbitSpeed: 0.012,
                            rotationSpeed: 0.02,
                            tilt: 0.15,
                            color: "#f59e0b",
                            atmosphereColor: "#fde047",
                            atmosphereOpacity: 0.35,
                            proceduralType: "venus",
                            temperature: "+88°C",
                            period: "22.4 Gün",
                            realDistance: "0.11 AU",
                            description: "Kalın bulut katmanlarıyla kaplı iç sınır gezegeni.",
                            moons: []
                        },
                        {
                            id: "kepler_186f",
                            name: "Kepler-186f",
                            type: "Kızıl Fotosentez Dünyası",
                            radius: 880,
                            orbitRadius: 68000,
                            orbitSpeed: 0.0085,
                            rotationSpeed: 0.022,
                            tilt: 0.25,
                            color: "#e11d48",
                            atmosphereColor: "#38bdf8",
                            atmosphereOpacity: 0.44,
                            hasClouds: true,
                            proceduralType: "exoplanet_habitable",
                            temperature: "+8°C",
                            period: "129.9 Gün",
                            realDistance: "0.432 AU",
                            description: "Kırmızı cüce ışığının dalga boyu nedeniyle yüzeyindeki olası bitkilerin kızıl ve mor tonlarında fotosentez yaptığı efsanevi yaşanabilir ötegezegen!",
                            moons: []
                        }
                    ]
                }
            ]
        },
        {
            id: "andromeda",
            name: "Andromeda Galaksisi (M31)",
            type: "Dev Sarmal Galaksi (SA(s)b)",
            diameter: "220.000 Işık Yılı",
            distanceFromEarth: "2,537 Milyon Işık Yılı",
            skyTint: { r: 0.12, g: 0.04, b: 0.22 },
            nebulaColors: ["#9d4edd", "#f72585", "#4cc9f0"],
            description: "Yerel Grup'taki en büyük galaksi! Yaklaşık 1 trilyon yıldıza ev sahipliği yapar ve Samanyolu'muza saniyede 110 km hızla yaklaşmaktadır.",
            systems: [
                {
                    id: "pa_99_n2",
                    name: "PA-99-N2 (Andromeda Ötegezegen Sistemi)",
                    subtitle: "Samanyolu Dışında Keşfedilen İlk Gezegen Adayı",
                    starType: "Kızıl Dev Yıldız (Red Giant)",
                    distance: "2,54 Milyon Işık Yılı",
                    description: "Kütleçekimsel mikro-mercekleme yöntemiyle Andromeda Galaksisi'nde tespit edilen tarihi yıldız sistemi. Devasa bir kızıl dev ve etrafında dönen süper-Jüpiter dünyaları içerir.",
                    stars: [
                        {
                            id: "pa99_star",
                            name: "PA-99-N2 Prime",
                            role: "Andromeda Kızıl Devi",
                            radius: 6800,
                            orbitRadius: 0,
                            orbitSpeed: 0,
                            color: "#ff4d6d",
                            coronaColor: "#c9184a",
                            lightColor: "#ffccd5",
                            temperature: "4.100 K",
                            mass: "1.6 Güneş Kütlesi",
                            proceduralType: "star_red",
                            description: "Andromeda'nın yoğun yıldız bulutları arasında parlayan devasa kızıl dev yıldız."
                        }
                    ],
                    bodies: [
                        {
                            id: "pa99_b",
                            name: "PA-99-N2 b",
                            type: "Galaksi Dışı Süper-Jüpiter",
                            radius: 2300,
                            orbitRadius: 34000,
                            orbitSpeed: 0.011,
                            rotationSpeed: 0.05,
                            tilt: 0.3,
                            color: "#c084fc",
                            atmosphereColor: "#e879f9",
                            atmosphereOpacity: 0.36,
                            temperature: "+210°C",
                            period: "3.2 Yıl",
                            realDistance: "2.8 AU",
                            proceduralType: "jupiter",
                            rings: {
                                innerRadius: 2700,
                                outerRadius: 5100,
                                color: "#d8b4fe",
                                opacity: 0.78,
                                detailBands: true
                            },
                            description: "Jüpiter'in 6.34 katı kütleye sahip, başka bir galakside keşfedilen ilk ötegezegen adayı! Mor-altın fırtına kuşakları ve devasa halkalarıyla büyüleyicidir.",
                            moons: [
                                {
                                    id: "andromeda_moon_1",
                                    name: "Mirach Prime (Okyanus Uydusu)",
                                    radius: 360,
                                    orbitRadius: 5800,
                                    orbitSpeed: 0.07,
                                    color: "#2dd4bf",
                                    proceduralType: "earth",
                                    description: "Andromeda galaksisinin parlak çekirdek ışığı altında parlayan okyanus uydusu."
                                }
                            ]
                        },
                        {
                            id: "pa99_c",
                            name: "N2-Crystallis",
                            type: "Karbon-Elmas Gezegeni",
                            radius: 980,
                            orbitRadius: 58000,
                            orbitSpeed: 0.008,
                            rotationSpeed: 0.025,
                            tilt: 0.5,
                            color: "#38bdf8",
                            atmosphereColor: "#a5f3fc",
                            atmosphereOpacity: 0.3,
                            temperature: "-45°C",
                            period: "7.4 Yıl",
                            realDistance: "4.6 AU",
                            proceduralType: "ice",
                            description: "Yüksek karbon oranı nedeniyle kabuğunun altında elmas katmanları barındıran parlak kristal yüzeyli gezegen.",
                            moons: []
                        }
                    ]
                }
            ]
        },
        {
            id: "triangulum",
            name: "Üçgen Galaksisi (Triangulum - M33)",
            type: "Sarmal Galaksi (SA(s)cd)",
            diameter: "60.000 Işık Yılı",
            distanceFromEarth: "2,73 Milyon Işık Yılı",
            skyTint: { r: 0.02, g: 0.12, b: 0.18 },
            nebulaColors: ["#00f5d4", "#00bbf9", "#f15bb5"],
            description: "Yerel Grup'un üçüncü en büyük üyesi. Yoğun yıldız oluşum bölgeleri (NGC 604) ve dev X-ışını ikili sistemleriyle ünlüdür.",
            systems: [
                {
                    id: "m33_x7",
                    name: "M33 X-7 (Kara Delik & Mavi Süperdev)",
                    subtitle: "Tutulmalı Kara Delik + Wolf-Rayet Yıldız Sistemi",
                    starType: "15.65 Güneş Kütleli Kara Delik & O7III Mavi Dev",
                    distance: "2,73 Milyon Işık Yılı",
                    description: "Gerçek astronomik gözlemlerle keşfedilmiş en sıra dışı sistemlerden biri! Güneş'ten 70 kat ağır devasa bir mavi yıldız ve onun plazmasını yutan parlak yığılma diskli bir Kara Delik!",
                    stars: [
                        {
                            id: "m33_blackhole",
                            name: "M33 X-7 Kara Deliği",
                            role: "Yıldız Kütleli Kara Delik (15.6 M☉)",
                            radius: 3600,
                            orbitRadius: 9000,
                            orbitSpeed: 0.008,
                            orbitPhase: 0,
                            color: "#000000",
                            coronaColor: "#00e5ff",
                            lightColor: "#80ffdb",
                            temperature: "10.000.000 K (Yığılma Diski)",
                            mass: "15.65 Güneş Kütlesi",
                            proceduralType: "black_hole",
                            description: "Olay ufku etrafında ışık hızına yakın dönen aşırı sıcak X-ışını yığılma diskine (Accretion Disk) sahip kara delik."
                        },
                        {
                            id: "m33_companion",
                            name: "M33 X-7 Mavi Süperdevi",
                            role: "O-Tipi Mavi Süperdev Yıldız",
                            radius: 6200,
                            orbitRadius: 9000,
                            orbitSpeed: 0.008,
                            orbitPhase: 3.14159,
                            color: "#38bdf8",
                            coronaColor: "#0284c7",
                            lightColor: "#e0f2fe",
                            temperature: "35.000 K",
                            mass: "70 Güneş Kütlesi",
                            proceduralType: "star_blue",
                            description: "Güneş'ten 500.000 kat daha parlak olan, kara deliğe sürekli yıldız rüzgarı akıtan devasa mavi yıldız."
                        }
                    ],
                    bodies: [
                        {
                            id: "x7_relic_a",
                            name: "Aegis-X7 (Süpernova Kalıntı Gezegeni)",
                            type: "Metalik Çekirdek Gezegeni",
                            radius: 950,
                            orbitRadius: 32000,
                            orbitSpeed: 0.012,
                            rotationSpeed: 0.04,
                            tilt: 0.2,
                            color: "#fb923c",
                            atmosphereColor: "#38bdf8",
                            atmosphereOpacity: 0.4,
                            temperature: "+540°C",
                            period: "18 Gün",
                            realDistance: "0.42 AU",
                            proceduralType: "lava",
                            description: "Kara deliği oluşturan antik süpernova patlamasından sağ kalan, yoğun manyetik kalkanlı ağır metal gezegeni.",
                            moons: []
                        },
                        {
                            id: "x7_halo_world",
                            name: "Nyx-Prime",
                            type: "Mavi Işıltılı Buz Devi",
                            radius: 1750,
                            orbitRadius: 56000,
                            orbitSpeed: 0.007,
                            rotationSpeed: 0.045,
                            tilt: 0.6,
                            color: "#06b6d4",
                            atmosphereColor: "#67e8f9",
                            atmosphereOpacity: 0.42,
                            temperature: "-90°C",
                            period: "85 Gün",
                            realDistance: "1.8 AU",
                            proceduralType: "uranus",
                            rings: {
                                innerRadius: 2100,
                                outerRadius: 3900,
                                color: "#22d3ee",
                                opacity: 0.72,
                                detailBands: true
                            },
                            description: "Mavi süperdev ve kara deliğin X-ışını parlamaları altında floresan aurora ışıklarıyla parlayan halkalı dev.",
                            moons: []
                        }
                    ]
                }
            ]
        },
        {
            id: "sombrero",
            name: "Sombrero Galaksisi (M104)",
            type: "Merceksi / Sarmal Galaksi (SA(s)a)",
            diameter: "50.000 Işık Yılı",
            distanceFromEarth: "29,35 Milyon Işık Yılı",
            skyTint: { r: 0.16, g: 0.10, b: 0.03 },
            nebulaColors: ["#ffbe0b", "#fb5607", "#ff006e"],
            description: "Muazzam parlak altın çekirdeği ve simetrik karanlık toz şeridiyle evrenin en görkemli galaksilerinden biri.",
            systems: [
                {
                    id: "sombrero_rim",
                    name: "M104 Altın Halka Kümesi",
                    subtitle: "Toz Kuşağı Sınırındaki Kadim Güneş Sistemi",
                    starType: "F5V Sarı-Beyaz Yıldız",
                    distance: "29,35 Milyon Işık Yılı",
                    description: "Sombrero Galaksisi'nin ikonik karanlık toz halkası ile parlak merkezi şişkinliği arasında yer alan, altın sarısı nebülöz bulutlarla çevrili zengin gezegen sistemi.",
                    stars: [
                        {
                            id: "sombrero_sun",
                            name: "Aurelia-M104",
                            role: "F5V Sarı-Beyaz Ana Kol Yıldızı",
                            radius: 5600,
                            orbitRadius: 0,
                            orbitSpeed: 0,
                            color: "#fef08a",
                            coronaColor: "#f59e0b",
                            lightColor: "#fffbeb",
                            temperature: "6.550 K",
                            mass: "1.35 Güneş Kütlesi",
                            proceduralType: "star_yellow",
                            description: "Güneş'imizden daha sıcak ve parlak olan altın-beyaz yıldız."
                        }
                    ],
                    bodies: [
                        {
                            id: "solaris_prime",
                            name: "Aurelia I (Çöl & Vaha Dünyası)",
                            type: "Karasal Süper-Dünya",
                            radius: 960,
                            orbitRadius: 24000,
                            orbitSpeed: 0.013,
                            rotationSpeed: 0.02,
                            tilt: 0.22,
                            color: "#f59e0b",
                            atmosphereColor: "#38bdf8",
                            atmosphereOpacity: 0.38,
                            hasClouds: true,
                            temperature: "+28°C",
                            period: "210 Gün",
                            realDistance: "0.85 AU",
                            proceduralType: "mars",
                            description: "Altın kumulları ve ekvatoral turkuaz iç denizleriyle Sombrero Galaksisi'nin yaşanabilir mücevheri.",
                            moons: []
                        },
                        {
                            id: "hyperion_giant",
                            name: "Aurelia II (Kronos)",
                            type: "Çift Halkalı Gaz Devi",
                            radius: 2100,
                            orbitRadius: 48000,
                            orbitSpeed: 0.008,
                            rotationSpeed: 0.05,
                            tilt: 0.48,
                            color: "#eab308",
                            atmosphereColor: "#fde047",
                            atmosphereOpacity: 0.3,
                            temperature: "-65°C",
                            period: "1.9 Yıl",
                            realDistance: "1.95 AU",
                            proceduralType: "saturn",
                            rings: {
                                innerRadius: 2500,
                                outerRadius: 5200,
                                color: "#fde68a",
                                opacity: 0.9,
                                detailBands: true
                            },
                            description: "Sombrero'nun toz diskinden beslenen devasa altın-kehribar halka sistemine sahip dev gezegen.",
                            moons: [
                                {
                                    id: "kronos_moon",
                                    name: "Thalassa",
                                    radius: 310,
                                    orbitRadius: 6100,
                                    orbitSpeed: 0.065,
                                    color: "#0ea5e9",
                                    proceduralType: "earth",
                                    description: "Dev halkaların manzarası altında tamamen derin okyanuslarla kaplı uydu."
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
