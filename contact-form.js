// js/contact-form.js

// Инициализация формы только на странице contact.html
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const formStatus = document.getElementById('formStatus');
    const submitButton = form.querySelector('.submit-button');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const countryCode = document.getElementById('countryCode').value;
        const phoneRaw = document.getElementById('phone').value.trim();
        const phone = `+${countryCode}${phoneRaw}`;

        const message = document.getElementById('message').value;

        submitButton.disabled = true;
        submitButton.innerHTML = '<span data-lang="fr">Envoi...</span><span data-lang="en" style="display: none;">Sending...</span><span>→</span>';
        formStatus.style.display = 'none';

        try {
            const response = await fetch('https://telegram-form-worker.kinameri20.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    name, 
                    email, 
                    phone: phone,
                    message 
                })

            });

            const data = await response.json();

            if (data.ok) {
                formStatus.className = 'form-status success';
                formStatus.innerHTML = '<span data-lang="fr">Message envoyé !</span><span data-lang="en" style="display: none;">Message sent!</span>';
                formStatus.style.display = 'block';
                form.reset();

                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.innerHTML = '<span data-lang="fr">Erreur d’envoi. Réessayez plus tard.</span><span data-lang="en" style="display: none;">Error sending. Please try again later.</span>';
            formStatus.style.display = 'block';
            console.error('Ошибка:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<span data-lang="fr">Envoyer</span><span data-lang="en" style="display: none;">Send</span><span>→</span>';
        }
    });
});


// three-contact.js
document.addEventListener('DOMContentLoaded', () => {
  const modelContainer = document.getElementById('model-container');
  if (!modelContainer || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  modelContainer.appendChild(renderer.domElement);

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
  const MODEL_FILE = 'star.glb';

  const loader = new THREE.GLTFLoader();
  loader.load(
    MODEL_FILE,
    function (gltf) {
      model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true;
          child.material.opacity = 0.3;
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

      const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      model = new THREE.Mesh(geometry, material);
      scene.add(model);
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

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
