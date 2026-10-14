// Инициализация Three.js только если есть контейнер
document.addEventListener('DOMContentLoaded', () => {
    const modelContainer = document.getElementById('model-container');
    if (!modelContainer) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    modelContainer.appendChild(renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight1.position.set(2, 2, 2);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xb6a4ff, 0.8);
    directionalLight2.position.set(-2, -1, -1);
    scene.add(directionalLight2);

    camera.position.z = 4;

    let model;

    // Shared visual identity with the homepage star (without changing its
    // contact-page placement, scale or animation).
    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    function getAdjustedAccent() {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        const accent = new THREE.Color(raw || '#9F88F2');
        if (!isDarkTheme()) return accent;
        const hsl = { h: 0, s: 0, l: 0 };
        accent.getHSL(hsl);
        accent.setHSL(hsl.h, Math.min(1, hsl.s * 1.13), Math.min(1, hsl.l * 0.96));
        return accent;
    }

    function updateStarMaterial() {
        const dark = isDarkTheme();
        renderer.toneMappingExposure = dark ? 0.86 : 0.88;
        ambientLight.intensity = dark ? 0.36 : 0.4;
        directionalLight1.intensity = dark ? 1.35 : 1.5;
        directionalLight2.intensity = dark ? 0.68 : 0.8;
        if (!model) return;
        const accent = getAdjustedAccent();
        model.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                if (material.color) material.color.copy(accent);
                if (material.emissive) {
                    material.emissive.copy(accent);
                    material.emissiveIntensity = 0.14;
                }
                material.transparent = true;
                material.opacity = 0.91;
                material.depthWrite = false;
                if (typeof material.metalness === 'number') material.metalness = dark ? 0.28 : 0.2;
                if (typeof material.roughness === 'number') material.roughness = dark ? 0.36 : 0.35;
                if ('clearcoat' in material) material.clearcoat = dark ? 0.10 : 0.08;
                if ('clearcoatRoughness' in material) material.clearcoatRoughness = dark ? 0.48 : 0.45;
                if ('transmission' in material) material.transmission = dark ? 0.05 : 0.04;
                if ('thickness' in material) material.thickness = dark ? 0.7 : 0.65;
                if ('ior' in material) material.ior = dark ? 1.12 : 1.1;
                material.needsUpdate = true;
            });
        });
    }
    new MutationObserver(updateStarMaterial).observe(document.documentElement, {
        attributes: true, attributeFilter: ['data-theme']
    });
    updateStarMaterial();

    const MODEL_FILE = 'star.glb';

    // Загрузка модели
    const loader = new THREE.GLTFLoader();
    loader.load(
        MODEL_FILE,
        function (gltf) {
            model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            // Slightly lower the star without moving the contact layout.
            model.position.y -= 0.22;

            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 6.0 / maxDim;
            model.scale.multiplyScalar(scale);

            scene.add(model);
            // Apply the same material settings as after a theme switch on first load.
            updateStarMaterial();
        },
        function (xhr) {
            if (xhr.total > 0) {
                console.log(Math.round((xhr.loaded / xhr.total * 100)) + '% загружено');
            }
        },
        function (error) {
            console.log('Модель не найдена, показываю запасную фигуру...');

            const size = 2;
            const segments = 50;
            const geometry = new THREE.ParametricGeometry(function(u, v, target) {
                u = u * 2 - 1;
                v = v * 2 - 1;

                const x = u * size;
                const y = (u * u - v * v) * size * 0.5;
                const z = v * size;

                target.set(x, y, z);
            }, segments, segments);

            const accent = getAdjustedAccent();
            const material = new THREE.MeshStandardMaterial({
                color: accent,
                emissive: accent,
                emissiveIntensity: 0.14,
                metalness: 0.28,
                roughness: 0.36,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.91
            });
            model = new THREE.Mesh(geometry, material);
            model.position.y -= 0.22;
            scene.add(model);
            updateStarMaterial();
        }
    );

    // Анимация
    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            const time = Date.now() * 0.0005;
            model.rotation.x = Math.sin(time) * 0.1;
            model.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    animate();

    // Адаптация при изменении размера окна
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
