const COLORS = {
  data: "#ff7a18",
  address: "#4cc9f0",
  control: "#00ff9c",
  glowData: "rgba(255,122,24,0.6)",
  glowAddr: "rgba(76,201,240,0.6)",
  glowCtrl: "rgba(0,255,156,0.6)",
  nodeFill: "#1b1f2a",
  nodeStroke: "#f5c542",
  text: "#e6e6e6",
  capsuleBg: "rgba(18, 22, 34, 0.88)",
  capsuleStroke: "rgba(255,255,255,0.08)",
};

const canvas = document.getElementById("datapath-preview");
if (!canvas) {
  console.warn("canvas missing");
} 
else {
  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = canvas.width = box.width;
    height = canvas.height = box.height;
  }

  new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);
  const nodes = {
    PC: { x: 0.08, y: 0.55 },
    IM: { x: 0.22, y: 0.55 },
    REG: { x: 0.40, y: 0.55 },
    ALU: { x: 0.58, y: 0.55 },
    MEM: { x: 0.78, y: 0.55 },
    CTRL: { x: 0.40, y: 0.20 },
    SIGN: { x: 0.40, y: 0.82 },
    MUX1: { x: 0.18, y: 0.25 },
    MUX2: { x: 0.52, y: 0.65 },
    MUX3: { x: 0.88, y: 0.55 },
    ADD1: { x: 0.30, y: 0.25 },
    ADD2: { x: 0.65, y: 0.25 },
  };

  const edges = [
    ["PC", "IM"],
    ["IM", "REG"],
    ["REG", "MUX2"],
    ["MUX2", "ALU"],
    ["ALU", "MEM"],
    ["MEM", "MUX3"],
    ["MUX3", "REG"],
    ["CTRL", "MUX2"],
    ["CTRL", "MUX3"],
    ["CTRL", "MUX1"],
    ["PC", "MUX1"],
    ["MUX1", "ADD1"],
    ["ADD1", "ADD2"],
    ["ADD2", "PC"],
    ["REG", "SIGN"],
    ["SIGN", "MUX2"],
  ];

  const graph = {};
  edges.forEach(([a, b]) => {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push(b);
    graph[b].push(a);
  });

  const signals = [];
  const INSTRUCTIONS = [
    { name: "ADD", type: "data", routeBias: "alu" },
    { name: "SUB", type: "data", routeBias: "alu" },
    { name: "LOAD", type: "address", routeBias: "mem" },
  ];

  function spawn() {
    const instr = INSTRUCTIONS[Math.floor(Math.random() * INSTRUCTIONS.length)];
    signals.push({
      current: "PC",
      prev: null,
      next: "IM",
      t: 0,
      speed: 0.009 + Math.random() * 0.004,
      type: instr.type,
      label: instr.name,
      bias: instr.routeBias,
      life: 0,
    });
  }

  setInterval(() => {
    const max = 6 + Math.floor(Math.random() * 3);
    if (signals.length < max && Math.random() < 0.6) spawn();
  }, 340);

  function color(type) {
    if (type === "control") return COLORS.control;
    if (type === "address") return COLORS.address;
    return COLORS.data;
  }

  function glow(type) {
    if (type === "control") return COLORS.glowCtrl;
    if (type === "address") return COLORS.glowAddr;
    return COLORS.glowData;
  }

  function pickNext(s) {
    const options = graph[s.current];
    if (!options) return null;
    let filtered = options.filter(n => n !== s.prev);
    if (filtered.length === 0) filtered = options;
    filtered.sort((a, b) => {
      const ax = nodes[a].x;
      const bx = nodes[b].x;
      if (s.bias === "mem") return bx - ax;
      if (s.bias === "alu") return bx - ax;
      return ax - bx;
    });
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  function drawNode(name, pulse) {
    const n = nodes[name];
    const x = n.x * width;
    const y = n.y * height;
    ctx.beginPath();
    ctx.arc(x, y, 12 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,200,80,0.05)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.nodeFill;
    ctx.fill();
    ctx.strokeStyle = COLORS.nodeStroke;
    ctx.stroke();
    const text = name;
    const w = ctx.measureText(text).width + 16;
    const h = 18;
    const lx = x - w / 2;
    const ly = y + 20;
    ctx.beginPath();
    ctx.roundRect(lx, ly, w, h, 6);
    ctx.fillStyle = COLORS.capsuleBg;
    ctx.fill();
    ctx.strokeStyle = COLORS.capsuleStroke;
    ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, x, ly + 13);
  }

  function drawEdge(a, b) {
    const n1 = nodes[a];
    const n2 = nodes[b];
    ctx.beginPath();
    ctx.moveTo(n1.x * width, n1.y * height);
    ctx.lineTo(n2.x * width, n2.y * height);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.stroke();
  }

  function animate(t) {
    ctx.clearRect(0, 0, width, height);
    const pulse = (Math.sin(t * 0.002) + 1) / 2;
    edges.forEach(([a, b]) => drawEdge(a, b));
    Object.keys(nodes).forEach(n => drawNode(n, pulse));
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      if (!s.next) {
        s.next = pickNext(s);
        if (!s.next) {
          signals.splice(i, 1);
          continue;
        }
      }
      const from = nodes[s.current];
      const to = nodes[s.next];
      const x =
        from.x * width + (to.x * width - from.x * width) * s.t;
      const y =
        from.y * height + (to.y * height - from.y * height) * s.t;

      const c = color(s.type);
      const g = glow(s.type);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.shadowBlur = 12;
      ctx.shadowColor = g;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 6;
      ctx.shadowColor = g;
      ctx.fillText(s.label, x, y - 12);
      ctx.shadowBlur = 0;
      s.t += s.speed;
      if (s.t >= 1) {
        s.t = 0;
        s.prev = s.current;
        s.current = s.next;
        s.next = null;
        s.life++;
        if (s.life > 16) signals.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }

  function start() {
    resize();
    requestAnimationFrame(animate);
  }
  start();
}
