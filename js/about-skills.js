<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Matter.js Falling Skills</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Matter.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0a;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .matter-wrapper {
      width: 800px;
      max-width: 100%;
      height: 500px;
      border-radius: 24px;
      border: 1px solid #333;
      background: radial-gradient(circle at top, #222 0, #000 60%);
      overflow: hidden;
      position: relative;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    }

    .matter-box {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* Элементы-скиллы */
    .dm-matter-elem,
    .dm-matter-elem-circle,
    .dm-matter-elem-pill {
      position: absolute;
      pointer-events: none;
      white-space: nowrap;
      padding: 10px 18px;
      font-size: 14px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(217, 255, 0, 0.1);
      border: 1px solid rgba(217, 255, 0, 0.6);
      color: #d9ff00;
      border-radius: 10px;
      box-sizing: border-box;
      text-align: center;
    }

    .dm-matter-elem-circle {
      border-radius: 999px;
    }

    .dm-matter-elem-pill {
      border-radius: 999px;
      padding-inline: 26px;
    }
  </style>
</head>
<body>

<div class="matter-wrapper">
  <div class="matter-box">
    <!-- Прямоугольники -->
    <div class="dm-matter-elem" style="left:40px; top:40px;">HTML</div>
    <div class="dm-matter-elem" style="left:220px; top:60px;">CSS</div>
    <div class="dm-matter-elem" style="left:420px; top:40px;">JavaScript</div>

    <!-- Круги -->
    <div class="dm-matter-elem-circle" style="left:100px; top:160px;">React</div>
    <div class="dm-matter-elem-circle" style="left:320px; top:150px;">Vue</div>

    <!-- Pills -->
    <div class="dm-matter-elem-pill" style="left:520px; top:140px;">TypeScript</div>
    <div class="dm-matter-elem-pill" style="left:260px; top:230px;">Three.js</div>
  </div>
</div>

<script>
(function () {
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

  // Создаём движок
  const engine = Engine.create();

  // Контейнер
  const matterBox = document.querySelector('.matter-box');

  // Рендер
  const render = Render.create({
    element: matterBox,
    engine: engine,
    options: {
      width: matterBox.clientWidth,
      height: matterBox.clientHeight,
      wireframes: false,
      background: 'transparent'
    }
  });

  // DOM-элементы
  let matterElems   = matterBox.querySelectorAll('.dm-matter-elem');
  let matterCircles = matterBox.querySelectorAll('.dm-matter-elem-circle');
  let matterPills   = matterBox.querySelectorAll('.dm-matter-elem-pill');

  // Прямоугольники
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

  // Круги
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

  // Pills (соединённые части)
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

  // Стены
  function createBoundaries() {
    const W = matterBox.clientWidth;
    const H = matterBox.clientHeight;

    const ground = Bodies.rectangle(W / 2, H, W, 1, { isStatic: true, render: { opacity: 0 } });
    const top    = Bodies.rectangle(W / 2, 0, W, 1, { isStatic: true, render: { opacity: 0 } });
    const left   = Bodies.rectangle(0, H / 2, 1, H, { isStatic: true, render: { opacity: 0 } });
    const right  = Bodies.rectangle(W, H / 2, 1, H, { isStatic: true, render: { opacity: 0 } });

    Composite.add(engine.world, [ground, top, left, right]);
  }

  // Создание тел
  let elemBodies   = createRectangles();
  let elemCircles  = createCircles();
  let elemPills    = createPills();
  createBoundaries();

  // Раннер и рендер
  const runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);

  // Мышь (drag & drop)
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

  // Синхронизация DOM после апдейта физики
  Events.on(engine, 'afterUpdate', function () {
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

  // Ресайз
  function handleResize() {
    Composite.clear(engine.world, false);
    createBoundaries();
    elemBodies   = createRectangles();
    elemCircles  = createCircles();
    elemPills    = createPills();

    render.options.width  = matterBox.clientWidth;
    render.options.height = matterBox.clientHeight;
  }

  window.addEventListener('resize', handleResize);
})();
</script>

</body>
</html>
