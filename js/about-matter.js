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
    Body,
    Query
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
    return createBoxBodies(matterCircles);
  }

  function createPills() {
    return createBoxBodies(matterPills);
  }

  // Matter.js has no asymmetric-rounded rectangle primitive. Using the
  // actual element width/height is a stable approximation for collisions.
  function createBoxBodies(elements) {
    return Array.from(elements).map(el => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = el.offsetLeft + w / 2;
      const y = el.offsetTop + h / 2;
      const body = Bodies.rectangle(x, y, w, h, {
        density: 0.01,
        friction: 0.15,
        restitution: 0.35,
        render: { visible: false }
      });
      Composite.add(engine.world, body);
      return body;
    });
  }

  function createBoundaries() {
    const W = matterBox.clientWidth;
    const H = matterBox.clientHeight;

    // Boundaries sit on the stage edges (no internal side/bottom gutter).
    // Thick external walls keep bodies from visually escaping at speed.
    const wallSize = 40;
    const ground = Bodies.rectangle(W / 2, H + wallSize / 2, W + wallSize * 2, wallSize, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const top    = Bodies.rectangle(W / 2, -wallSize / 2, W + wallSize * 2, wallSize, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const left   = Bodies.rectangle(-wallSize / 2, H / 2, wallSize, H + wallSize * 2, {
      isStatic: true,
      render: { opacity: 0 }
    });
    const right  = Bodies.rectangle(W + wallSize / 2, H / 2, wallSize, H + wallSize * 2, {
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

  // Matter.Mouse registers wheel handlers that call preventDefault().
  // The wheel is not needed for dragging bodies, so detach only those
  // handlers and let the browser scroll the page normally over the canvas.
  for (const eventName of ['wheel', 'mousewheel', 'DOMMouseScroll']) {
    render.canvas.removeEventListener(eventName, mouse.mousewheel);
  }
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });
  Composite.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  // Matter's canvas overlays the visible HTML chips, so :hover on chips
  // cannot fire. Detect which physics body lies under the pointer and add
  // a CSS class to its corresponding HTML element. Dragging still works.
  let chipsAndBodies = [];
  let chipBodies = [];
  function syncChipBodies() {
    chipsAndBodies = [
      ...elemBodies.map((body, i) => ({ body, el: matterElems[i] })),
      ...elemCircles.map((body, i) => ({ body, el: matterCircles[i] })),
      ...elemPills.map((body, i) => ({ body, el: matterPills[i] }))
    ];
    chipBodies = chipsAndBodies.map(item => item.body);
  }
  syncChipBodies();
  let hoveredChip = null;
  function clearChipHover() {
    if (hoveredChip) hoveredChip.classList.remove('skill-is-hovered');
    hoveredChip = null;
  }
  render.canvas.addEventListener('pointermove', (event) => {
    const rect = render.canvas.getBoundingClientRect();
    const point = {
      x: (event.clientX - rect.left) * (render.options.width / rect.width),
      y: (event.clientY - rect.top) * (render.options.height / rect.height)
    };
    const hits = Query.point(chipBodies, point);
    const match = hits.length ? chipsAndBodies.find(item => item.body === hits[hits.length - 1]) : null;
    const next = match?.el || null;
    if (next === hoveredChip) return;
    clearChipHover();
    hoveredChip = next;
    if (hoveredChip) hoveredChip.classList.add('skill-is-hovered');
  });
  render.canvas.addEventListener('pointerleave', clearChipHover);

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
    clearChipHover();
    Composite.clear(engine.world, false);
    createBoundaries();
    elemBodies  = createRectangles();
    elemCircles = createCircles();
    elemPills   = createPills();
    syncChipBodies();

    render.options.width  = matterBox.clientWidth;
    render.options.height = matterBox.clientHeight;
  }

  window.addEventListener('resize', handleResize);

  return { engine, render, runner, mouseConstraint, handleResize };
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
    const { engine, render, runner, handleResize } = currentPhysics;
    window.removeEventListener('resize', handleResize);
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

      // Measure each label before placing it: larger chips must start fully
      // within the stage, otherwise they could clip at the edges.
      stage.appendChild(el);
      const chipW = el.offsetWidth;
      const chipH = el.offsetHeight;
      const availableX = Math.max(0, W - chipW);
      const x = Math.random() * availableX;
      // A small stagger keeps the satisfying falling / piling behaviour.
      const y = Math.min(Math.max(8, H - chipH - 8), 8 + idx * 12);
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
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
