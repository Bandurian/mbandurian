// three-portfolio.js
document.addEventListener('DOMContentLoaded', () => {
  const modelContainer = document.getElementById('model-container');
  if (!modelContainer || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(600, 600);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  modelContainer.appendChild(renderer.domElement);

  setTimeout(() => {
    modelContainer.style.opacity = '1';
    modelContainer.style.transform = 'translate(-50%, -50%)';
  }, 100);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 1.5);
  directionalLight1.position.set(2, 2, 2);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0x0088ff, 0.8);
  directionalLight2.position.set(-2, -1, -1);
  scene.add(directionalLight2);

  camera.position.z = 4;

  let model;
  const MODEL_FILE = 'star.gltf';

  const loader = new THREE.GLTFLoader();
  loader.load(
    MODEL_FILE,
    function (gltf) {
      model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.7;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 6.0 / maxDim;
      model.scale.multiplyScalar(scale);

      scene.add(model);
    },
    undefined,
    function () {
      console.log('⚠ Модель "' + MODEL_FILE + '" не найдена, показываю запасную фигуру...');

      const size = 2;
      const segments = 50;
      const geometry = new THREE.ParametricGeometry(function (u, v, target) {
        u = u * 2 - 1;
        v = v * 2 - 1;

        const x = u * size;
        const y = (u * u - v * v) * size * 0.5;
        const z = v * size;

        target.set(x, y, z);
      }, segments, segments);

      const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });

      model = new THREE.Mesh(geometry, material);
      scene.add(model);

      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      model.add(wireframe);
    }
  );

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
});
