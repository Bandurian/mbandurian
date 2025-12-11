// Набор скиллов для трёх вкладок
const SKILLS = {
  frontend: [
    { label: 'HTML',          type: 'rect'   },
    { label: 'CSS',           type: 'rect'   },
    { label: 'JavaScript',    type: 'rect'   },
    { label: 'WordPress',     type: 'pill'   },
    { label: 'WooCommerce',   type: 'pill'   },
    { label: 'Divi Builder',  type: 'pill'   },
    { label: 'Responsive web',type: 'circle' }
  ],
  design: [
    { label: 'UX', type: 'circle' },
    { label: 'UI',     type: 'rect'   },
    // { label: 'Design de produits',          type: 'pill'   },
    { label: 'Identité de marque',          type: 'rect'   },
    { label: 'Design graphique',            type: 'rect'   },
    { label: 'Typographie',                 type: 'pill'   },
    { label: 'Design produits imprimés',    type: 'pill'   }
  ],
  tools: [
    { label: 'Figma',        type: 'circle' },
    { label: 'Adobe Illustrator', type: 'rect' },
    { label: 'Adobe Photoshop',   type: 'rect' },
    { label: 'Adobe InDesign',    type: 'pill' },
    { label: 'Adobe After Effects', type: 'pill' },
    { label: 'Blender',      type: 'circle' },
    { label: 'Unity',        type: 'pill'   }
  ]
};


function initMatterForStage(stageEl) {
  const {
    Engine,
    Render,
    Runner,
    Bodies,
    Composite,
    MouseConstraint,
    Mouse,
    Events,
    Body
  } = Matter;

  const engine = Engine.create();
  const matterBox = stageEl;

  const render = Render.create({
    element: matterBox,
    engine,
    options: {
      width: matterBox.clientWidth,
      height: matterBox.clientHeight,
      wireframes: false,
      background: 'transparent'
    }
  });

  let matterElems   = matterBox.querySelectorAll('.dm-matter-elem');
  let matterCircles = matterBox.querySelectorAll('.dm-matter-elem-circle');
  let matterPills   = matterBox.querySelectorAll('.dm-matter-elem-pill');

  function createRectangles() {
    return Array.from(matterElems).map(el => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = el.offsetLeft + w / 2;
      const y = el.offsetTop  + h / 2;

      const body = Bodies.rectangle(x, y, w, h, {
        density: 0.01,
        friction: 0.1,
        restitution: 0.4,
        render: { opacity: 0 }
      });

      Composite.add(engine.world, body);
      return body;
    });
  }

  function createCircles() {
    return Array.from(matterCircles).map(el => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = el.offsetLeft + w / 2;
      const y = el.offsetTop  + h / 2;
      const r = Math.max(w, h) / 2;

      const body = Bodies.circle(x, y, r, {
        density: 0.01,
        friction: 0.1,
        restitution: 0.4,
        render: { opacity: 0 }
      });

      Composite.add(engine.world, body);
      return body;
    });
  }

  function createPills() {
    return Array.from(matterPills).map(el => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = el.offsetLeft + w / 2;
      const y = el.offsetTop  + h / 2;
      const r = h / 2;

      const leftCircle = Bodies.circle(x - w / 2 + r, y, r, {
        density: 0.01,
        friction: 0.1,
        restitution: 0.4,
        render: { opacity: 0 }
      });

      const rightCircle = Bodies.circle(x + w / 2 - r, y, r, {
        density: 0.01,
        friction: 0.1,
        restitution: 0.4,
        render: { opacity: 0 }
      });

      const rect = Bodies.rectangle(x, y, w - h, h, {
        density: 0.01,
        friction: 0.1,
        restitution: 0.4,
        render: { opacity: 0 }
      });

      const pillBody = Body.create({
        parts: [leftCircle, rightCircle, rect],
        friction: 0.1,
        restitution: 0.4
      });

      Composite.add(engine.world, pillBody);
      return pillBody;
    });
  }

  function createBoundaries() {
    const W = matterBox.clientWidth;
    const H = matterBox.clientHeight;

    const ground = Bodies.rectangle(W / 2, H, W, 1, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const top    = Bodies.rectangle(W / 2, 0, W, 1, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const left   = Bodies.rectangle(0, H / 2, 1, H, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const right  = Bodies.rectangle(W, H / 2, 1, H, {
      isStatic: true,
      render: { opacity: 0 }
    });

    Composite.add(engine.world, [ground, top, left, right]);
  }

  let elemBodies  = createRectangles();
  let elemCircles = createCircles();
  let elemPills   = createPills();
  createBoundaries();

  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Events.on(engine, 'afterUpdate', () => {
    elemBodies.forEach((body, i) => {
      const el = matterElems[i];
      if (!el) return;
      el.style.left = (body.position.x - el.offsetWidth / 2) + 'px';
      el.style.top  = (body.position.y - el.offsetHeight / 2) + 'px';
      el.style.transform = 'rotate(' + body.angle + 'rad)';
    });

    elemCircles.forEach((body, i) => {
      const el = matterCircles[i];
      if (!el) return;
      el.style.left = (body.position.x - el.offsetWidth / 2) + 'px';
      el.style.top  = (body.position.y - el.offsetHeight / 2) + 'px';
      el.style.transform = 'rotate(' + body.angle + 'rad)';
    });

    elemPills.forEach((body, i) => {
      const el = matterPills[i];
      if (!el) return;
      el.style.left = (body.position.x - el.offsetWidth / 2) + 'px';
      el.style.top  = (body.position.y - el.offsetHeight / 2) + 'px';
      el.style.transform = 'rotate(' + body.angle + 'rad)';
    });
  });

  function handleResize() {
    Composite.clear(engine.world, false);
    createBoundaries();
    elemBodies  = createRectangles();
    elemCircles = createCircles();
    elemPills   = createPills();

    render.options.width  = matterBox.clientWidth;
    render.options.height = matterBox.clientHeight;
  }

  window.addEventListener('resize', handleResize);

  return { engine, render, runner, mouseConstraint };
}


// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('skillsStage');
  const tabs  = document.querySelectorAll('.skills-tab');

  if (!stage || !tabs.length || typeof Matter === 'undefined') {
    return;
  }

  let currentPhysics = null;

  function destroyPhysics() {
    if (!currentPhysics) return;
    const { engine, render, runner } = currentPhysics;
    Matter.Runner.stop(runner);
    Matter.Render.stop(render);
    Matter.World.clear(engine.world, false);
    Matter.Engine.clear(engine);
    if (render.canvas && render.canvas.parentNode) {
      render.canvas.parentNode.removeChild(render.canvas);
    }
    currentPhysics = null;
  }

  function renderSkills(group) {
    destroyPhysics();
    stage.innerHTML = '';

    const skills = SKILLS[group] || [];
    const W = stage.clientWidth  || 400;
    const H = stage.clientHeight || 320;

    skills.forEach((skill, idx) => {
      const el = document.createElement('div');

      if (skill.type === 'circle') {
        el.className = 'dm-matter-elem-circle';
      } else if (skill.type === 'pill') {
        el.className = 'dm-matter-elem-pill';
      } else {
        el.className = 'dm-matter-elem';
      }

      el.textContent = skill.label;

      const margin = 40;
      const x = margin + Math.random() * (W - margin * 2);
      const y = 20 + idx * 10;

      el.style.left = x + 'px';
      el.style.top  = y + 'px';

      stage.appendChild(el);
    });

    currentPhysics = initMatterForStage(stage);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const group = tab.getAttribute('data-group');
      renderSkills(group);
    });
  });

  // Стартовая вкладка
  renderSkills('design');
});
