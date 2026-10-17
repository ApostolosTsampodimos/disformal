// The spectral cube: a 3×3×3 puzzle drawn with CSS 3D. Slices twist through a scramble,
// then solve themselves back. Faces are lit per frame from a fixed light, so the cube reads as solid.

const AXES = ["x", "y", "z"];
const AXIS_VEC = { x: "1,0,0", y: "0,1,0", z: "0,0,1" };
const NORMALS = {
  px: [1, 0, 0],
  nx: [-1, 0, 0],
  py: [0, 1, 0],
  ny: [0, -1, 0],
  pz: [0, 0, 1],
  nz: [0, 0, -1],
};
// Singmaster notation in CSS axes (y points down): [face letter, direction that is clockwise].
const NAMES = {
  x: { 1: ["R", 1], "-1": ["L", -1], 0: ["M", -1] },
  y: { "-1": ["U", -1], 1: ["D", 1], 0: ["E", 1] },
  z: { 1: ["F", 1], "-1": ["B", -1], 0: ["S", 1] },
};
const BASE_PITCH = -26;
const BASE_YAW = -38;
const SCRAMBLE_LENGTH = 7;
// How long autoplay waits after the visitor's last move before it rewinds and resumes.
const USER_HOLD = 9000;
const LIGHT = (() => {
  const v = [-0.45, -0.7, 0.55];
  const m = Math.hypot(...v);
  return v.map((n) => n / m);
})();

function rot(axis, deg) {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  if (axis === "x")
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c],
    ];
  if (axis === "y")
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c],
    ];
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}
const mul = (A, B) =>
  A.map((r) =>
    [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]),
  );
const apply = (A, v) => A.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
const quarter = (axis, dir) =>
  rot(axis, 90 * dir).map((r) => r.map(Math.round));
const mat3d = (O) =>
  `matrix3d(${O[0][0]},${O[1][0]},${O[2][0]},0,${O[0][1]},${O[1][1]},${O[2][1]},0,${O[0][2]},${O[1][2]},${O[2][2]},0,0,0,0,1)`;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const moveName = ({ axis, layer, dir }) => {
  const [letter, clockwise] = NAMES[axis][layer];
  return letter + (dir === clockwise ? "" : "′");
};

export function mountCube(stage) {
  const cube = stage.querySelector(".cube");
  const movesEl = stage.querySelector("[data-moves]");
  const stateEl = stage.querySelector("[data-state]");
  const twistBtn = stage.querySelector("[data-twist]");
  const solveBtn = stage.querySelector("[data-solve]");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cubies = [...cube.querySelectorAll(".cubie")].map((el) => ({
    el,
    pos: [Number(el.dataset.x), Number(el.dataset.y), Number(el.dataset.z)],
    O: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    faces: [...el.querySelectorAll(".face--out")].map((f) => ({
      el: f,
      n: NORMALS[f.dataset.f],
      lit: -1,
    })),
  }));

  let yaw = BASE_YAW;
  let pitch = BASE_PITCH;
  let velYaw = 0;
  let tilt = [0, 0];
  let tiltTarget = [0, 0];
  let dragging = false;
  let dragDist = 0;
  let last = [0, 0];
  let lastInteract = -Infinity;
  let twist = null;
  let phase = "rest";
  let remaining = 0;
  let waitUntil = performance.now() + 900;
  let userUntil = 0;
  let solveDur = 470;
  let queued = 0;
  let raf = 0;
  let visible = false;
  const history = [];
  const recent = [];

  const setState = (s) => {
    if (stateEl.textContent !== s) stateEl.textContent = s;
  };

  function place(c, axisVec, angle) {
    const [x, y, z] = c.pos;
    const spin = axisVec ? `rotate3d(${axisVec},${angle}deg) ` : "";
    c.el.style.transform = `${spin}translate3d(calc(var(--pitch) * ${x}), calc(var(--pitch) * ${y}), calc(var(--pitch) * ${z})) ${mat3d(c.O)}`;
  }

  function randomMove() {
    const prev = history[history.length - 1];
    let m;
    do {
      m = {
        axis: AXES[Math.floor(Math.random() * 3)],
        layer: Math.floor(Math.random() * 3) - 1,
        dir: Math.random() < 0.5 ? 1 : -1,
      };
    } while (prev && prev.axis === m.axis && prev.layer === m.layer);
    return m;
  }

  function start(move, dur, user = false) {
    const i = AXES.indexOf(move.axis);
    twist = {
      ...move,
      user,
      angle: 0,
      start: performance.now(),
      dur: still ? 0 : dur,
      moving: new Set(cubies.filter((c) => c.pos[i] === move.layer)),
    };
    for (const c of twist.moving) c.el.classList.toggle("is-turning", user);
    recent.push({ name: moveName(move), user });
    if (recent.length > 6) recent.shift();
    movesEl.replaceChildren(
      ...recent.map((m) =>
        Object.assign(document.createElement("span"), {
          textContent: m.name,
          className: m.user ? "is-user" : "",
        }),
      ),
    );
    solveBtn.disabled = history.length === 0;
  }

  function commit(now) {
    const Q = quarter(twist.axis, twist.dir);
    for (const c of twist.moving) {
      c.pos = apply(Q, c.pos);
      c.O = mul(Q, c.O);
      place(c);
      c.el.classList.remove("is-turning");
    }
    twist = null;
    waitUntil = now + 140;
  }

  function sequence(now) {
    if (twist) return;
    if (queued) {
      queued--;
      const m = randomMove();
      history.push(m);
      start(m, 420, true);
      setState("Your move");
      return;
    }
    if (now < userUntil) return; // the visitor is playing: autoplay keeps its hands off
    if (phase === "solve") {
      if (now < waitUntil) return;
      const m = history.pop();
      if (m) {
        start({ ...m, dir: -m.dir }, solveDur);
        setState("Solving");
        return;
      }
      phase = "rest";
      solveDur = 470;
      waitUntil = now + 6500;
      setState("Solved");
      return;
    }
    if (still || now < waitUntil) return;
    if (phase === "rest") {
      phase = "scramble";
      remaining = SCRAMBLE_LENGTH;
    }
    if (remaining > 0) {
      remaining--;
      const m = randomMove();
      history.push(m);
      start(m, 640);
      setState("Scrambling");
    } else {
      phase = "solve";
      waitUntil = now + 1100;
    }
  }

  function light() {
    const p = pitch + tilt[1];
    const y = yaw + tilt[0];
    const V = mul(rot("x", p), rot("y", y));
    const T = twist ? rot(twist.axis, twist.angle) : null;
    for (const c of cubies) {
      const M = T && twist.moving.has(c) ? mul(V, mul(T, c.O)) : mul(V, c.O);
      for (const f of c.faces) {
        const w = apply(M, f.n);
        const lit =
          Math.round(
            Math.max(0, w[0] * LIGHT[0] + w[1] * LIGHT[1] + w[2] * LIGHT[2]) *
              100,
          ) / 100;
        if (lit !== f.lit) {
          f.lit = lit;
          f.el.style.setProperty("--lit", lit);
        }
      }
    }
    cube.style.transform = `rotateX(${p}deg) rotateY(${y}deg)`;
  }

  function frame(now) {
    const idle = now - lastInteract > 1600;
    if (!dragging) {
      yaw += velYaw;
      velYaw *= 0.93;
      if (idle && !still) {
        // Sway around the resting angle rather than spin, so no face squares up to the viewer.
        yaw = BASE_YAW + ((((yaw - BASE_YAW) % 360) + 540) % 360) - 180;
        yaw += (BASE_YAW + 20 * Math.sin(now / 2800) - yaw) * 0.03;
        pitch += (BASE_PITCH - pitch) * 0.03;
      }
    }
    tilt = tilt.map((t, i) => t + (tiltTarget[i] - t) * 0.06);
    if (twist) {
      const t = twist.dur ? Math.min(1, (now - twist.start) / twist.dur) : 1;
      twist.angle = ease(t) * 90 * twist.dir;
      for (const c of twist.moving) place(c, AXIS_VEC[twist.axis], twist.angle);
      if (t === 1) commit(now);
    }
    sequence(now);
    light();
    // Under reduced motion the loop sleeps once nothing is moving; interactions wake it.
    const solving = phase === "solve" && history.length > 0 && now >= userUntil;
    const settled = still && !dragging && !twist && !queued && !solving && Math.abs(velYaw) < 0.01;
    raf = settled ? 0 : requestAnimationFrame(frame);
  }

  const kick = () => {
    if (raf || !visible) return;
    raf = requestAnimationFrame(frame);
  };

  const onDown = (e) => {
    if (e.target.closest(".refractor__foot")) return;
    dragging = true;
    dragDist = 0;
    last = [e.clientX, e.clientY];
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
    kick();
  };
  const onMove = (e) => {
    if (dragging) {
      const dx = e.clientX - last[0];
      const dy = e.clientY - last[1];
      last = [e.clientX, e.clientY];
      dragDist += Math.abs(dx) + Math.abs(dy);
      yaw += dx * 0.4;
      velYaw = dx * 0.4;
      pitch = Math.max(-70, Math.min(25, pitch - dy * 0.35));
      lastInteract = performance.now();
      return;
    }
    if (still) return;
    const r = stage.getBoundingClientRect();
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    tiltTarget = [
      clamp((e.clientX - r.left) / r.width - 0.5) * 16,
      -clamp((e.clientY - r.top) / r.height - 0.5) * 12,
    ];
  };
  const onUp = (e) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    lastInteract = performance.now();
    if (e.type === "pointerup" && dragDist < 6) onTwist();
    kick();
  };
  // The visitor takes over: their moves stay put until they solve, or until they leave it alone.
  function onTwist() {
    queued++;
    lastInteract = performance.now();
    userUntil = still ? Infinity : lastInteract + USER_HOLD;
    // Hurry any automatic turn so the visitor's move starts at once.
    if (twist && !twist.user) twist.dur = Math.min(twist.dur, lastInteract - twist.start + 140);
    setState("Your move");
    phase = "solve";
    waitUntil = 0;
    twistBtn.classList.remove("is-pressed");
    void twistBtn.offsetWidth;
    twistBtn.classList.add("is-pressed");
    kick();
  }
  const onSolve = () => {
    queued = 0;
    userUntil = 0;
    phase = "solve";
    waitUntil = 0;
    solveDur = 260;
    lastInteract = performance.now();
    if (history.length) setState("Solving");
    kick();
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  twistBtn.addEventListener("click", onTwist);
  solveBtn.addEventListener("click", onSolve);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    raf = 0;
    if (visible) {
      addEventListener("pointermove", onMove, { passive: true });
      kick();
    } else {
      removeEventListener("pointermove", onMove);
    }
  });
  io.observe(stage);
  setState("Solved");

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    removeEventListener("pointermove", onMove);
  };
}
