/* ==========================================================================
   RECURSION COMMAND DECK // LOGIC CORE v2.1 (FIXED LAYOUT)
   ========================================================================== */

console.log("%c SYSTEM ONLINE // RECURSION DECK ", "background: #00f3ff; color: #000; font-weight: bold; padding: 4px;");

// [GLOBAL CONFIG]
const CONFIG = {
    speed: 800,          // Animation delay
    nodeSize: 44,        
    levelGap: 90,        // Vertical gap
    colors: {
        cyan: '#00f3ff',
        green: '#00ff9d',
        rose: '#ff0055',
        dim: '#5c7c8a',
        line: '#5c7c8a'
    }
};

// [STATE]
const STATE = {
    root: null,
    isRunning: false,
    nodesMap: {},
    cursorY: 40
};
// ================================
// UI STATE CONTROLLER
// ================================
const UI = {
    clearNodeState(nodeId) {
        const el = document.getElementById(`node-${nodeId}`);
        if (!el) return;
        el.classList.remove(
            'node-call',
            'node-process',
            'node-return',
            'node-done'
        );
        el.removeAttribute('data-state');
    },

    setNodeState(nodeId, state) {
        const el = document.getElementById(`node-${nodeId}`);
        if (!el) return;

        UI.clearNodeState(nodeId);

        el.classList.add(`node-${state.toLowerCase()}`);
        el.setAttribute('data-state', state.toUpperCase());
    },

    setStackState(el, state) {
        if (!el) return;
        el.classList.remove('call', 'wait', 'return');
        el.classList.add(state);
    },

    setCircuitState(el, state) {
        if (!el) return;
        el.classList.add(state);
    }
};

// ==========================================================================
// MODULE 1: UTILITIES
// ==========================================================================
const UTILS = {
    sleep: (ms) => new Promise(r => setTimeout(r, ms)),
    get: (id) => document.getElementById(id),

    // Safe Input Parser
    parseInput: () => {
        try {
            const raw = UTILS.get('rawInput').value.trim();
            let clean = raw.replace(/'/g, '"').replace(/null/g, 'null');
            if (!clean.startsWith('[')) clean = `[${clean}]`;
            const arr = JSON.parse(clean);
            if (!Array.isArray(arr)) throw new Error("Not Array");
            return arr;
        } catch (e) {
            alert("INPUT ERROR: Use format [1, 2, null, 3]");
            return null;
        }
    },

    // Draw Line (Ortho or Direct)
    drawPolyLine: (points, color, svgId, dashed = false) => {
        const svg = UTILS.get(svgId);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }

        path.setAttribute("d", d);
        path.setAttribute("class", "edge");
        path.style.stroke = color;
        path.style.strokeWidth = "2";
        path.style.fill = "none";
        if (dashed) path.style.strokeDasharray = "5,5";
        
        svg.appendChild(path);
        return path;
    },

    copy: (id) => {
        const el = UTILS.get(id);
        el.select();
        navigator.clipboard.writeText(el.value);
        // Visual flash
        el.style.borderColor = CONFIG.colors.green;
        setTimeout(() => el.style.borderColor = '', 300);
    }
};

// ==========================================================================
// MODULE 2: TREE ENGINE (WITH SMART CENTERING)
// ==========================================================================
class TreeNode {
    constructor(val, id) {
        this.val = val; this.id = id;
        this.left = null; this.right = null;
        this.x = 0; this.y = 0;
    }
}

const TREE_ENGINE = {
    // 1. Build Logic
    build: () => {
        const arr = UTILS.parseInput();
        const type = UTILS.get('inputType').value;
        if (!arr) return null;

        if (type === 'pre') return TREE_ENGINE.buildPreorder(arr);
        return TREE_ENGINE.buildLevelOrder(arr);
    },

    buildLevelOrder: (arr) => {
        if (!arr.length || arr[0] === null) return null;
        let root = new TreeNode(arr[0], 0);
        let queue = [root];
        let i = 1, idCtr = 1;

        while (i < arr.length) {
            let curr = queue.shift();
            if (i < arr.length && arr[i] !== null) {
                curr.left = new TreeNode(arr[i], idCtr++);
                queue.push(curr.left);
            }
            i++;
            if (i < arr.length && arr[i] !== null) {
                curr.right = new TreeNode(arr[i], idCtr++);
                queue.push(curr.right);
            }
            i++;
        }
        return root;
    },

    buildPreorder: (arr) => {
        let idx = 0, idCtr = 0;
        function helper() {
            if (idx >= arr.length || arr[idx] === null) { idx++; return null; }
            let node = new TreeNode(arr[idx++], idCtr++);
            node.left = helper();
            node.right = helper();
            return node;
        }
        return helper();
    },

    // 2. HELPER: Get Tree Height
    getHeight: (node) => {
        if (!node) return 0;
        return 1 + Math.max(TREE_ENGINE.getHeight(node.left), TREE_ENGINE.getHeight(node.right));
    },

    // 3. SMART LAYOUT (The Fix)
    calculateLayout: (root) => {
        if (!root) return;

        // Step A: Calculate Relative Positions (Assume Root is at 0,0)
        let minX = Infinity;
        let maxX = -Infinity;
        const height = TREE_ENGINE.getHeight(root);

        const assignRelative = (node, x, depth) => {
            if (!node) return;
            node.x = x;
            node.y = 60 + (depth * CONFIG.levelGap);
            
            // Track Width bounds
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);

            // Dynamic Spread: 2^(height-depth) ensures no overlap
            // 35 is the base multiplier for spacing
            const spread = 35 * Math.pow(2, height - depth - 2); 
            // Clamp spread so it doesn't get too small
            const safeSpread = Math.max(spread, 40); 

            assignRelative(node.left, x - safeSpread, depth + 1);
            assignRelative(node.right, x + safeSpread, depth + 1);
        };

        assignRelative(root, 0, 0);

        // Step B: Center in Viewport
        const container = UTILS.get('canvasTree');
        const containerWidth = container.offsetWidth;
        const treeWidth = maxX - minX;
        
        // Calculate offset to move tree into view
        let offsetX = 0;
        
        // If tree fits, center it. If not, add padding from left edge.
        if (treeWidth < containerWidth) {
            offsetX = (containerWidth / 2) - ((minX + maxX) / 2);
        } else {
            offsetX = -minX + 50; // 50px Left Padding
        }

        const applyOffset = (node) => {
            if (!node) return;
            node.x += offsetX;
            applyOffset(node.left);
            applyOffset(node.right);
        };
        applyOffset(root);

        // Step C: Resize SVG (To prevent cutting off)
        const svg = UTILS.get('svgTreeLayer');
        const totalW = Math.max(containerWidth, treeWidth + 150);
        const totalH = Math.max(container.offsetHeight, (height * CONFIG.levelGap) + 150);
        
        svg.style.width = `${totalW}px`;
        svg.style.height = `${totalH}px`;
    },

    // 4. Render
    render: (root) => {
        const divLayer = UTILS.get('canvasTree');
        const svgLayer = UTILS.get('svgTreeLayer');
        
        // Clean
        divLayer.querySelectorAll('.tree-node').forEach(e => e.remove());
        svgLayer.innerHTML = '';

        if (!root) return;

        const draw = (node) => {
            if (!node) return;

            // Draw Lines (Edges)
            if (node.left) {
                UTILS.drawPolyLine([
                    {x: node.x + 22, y: node.y + 22},
                    {x: node.left.x + 22, y: node.left.y + 22}
                ], CONFIG.colors.line, 'svgTreeLayer');
                draw(node.left);
            }
            if (node.right) {
                UTILS.drawPolyLine([
                    {x: node.x + 22, y: node.y + 22},
                    {x: node.right.x + 22, y: node.right.y + 22}
                ], CONFIG.colors.line, 'svgTreeLayer');
                draw(node.right);
            }

            // Draw Node
            const el = document.createElement('div');
            el.className = 'tree-node';
            el.innerText = node.val;
            el.id = `node-${node.id}`;
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            divLayer.appendChild(el);
        };

        draw(root);
    }
};
function fixCircuitSVGHeight(y) {
  const svg = document.getElementById("svgCircuitLayer");
  if (!svg) return;

  const h = Math.max(y + 120, svg.clientHeight);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 2000 ${h}`);
}


// ==========================================================================
// MODULE 3: CIRCUIT TRACER (Straight Lines Only)
// ==========================================================================
const CIRCUIT = {
    init: () => {
        UTILS.get('canvasCircuit').querySelectorAll('.circuit-box').forEach(e => e.remove());
        UTILS.get('svgCircuitLayer').innerHTML = '';
        UTILS.get('stackList').innerHTML = '';
        STATE.cursorY = 40;
    },

    // Call Visualization
    drawCall: (val, depth, pPos) => {
        const container = UTILS.get('canvasCircuit');
        const x = 40 + (depth * 50); // Fixed Indentation
        const y = STATE.cursorY;

        // Box
       const box = document.createElement('div');
box.className = 'circuit-box call';

        box.innerHTML = `<span style="color:${CONFIG.colors.cyan}">CALL</span>(${val})`;
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        box.id = `trace-${y}`;
        container.appendChild(box);

        // Orthogonal Line (L-Shape) from Parent
        if (pPos) {
            const pX = pPos.x + 10;
            const pY = pPos.y + 30; // Bottom of parent
            
            UTILS.drawPolyLine([
                {x: pX, y: pY},     // Start
                {x: pX, y: y + 15}, // Down
                {x: x, y: y + 15}   // Right
            ], CONFIG.colors.dim, 'svgCircuitLayer');
        }

        // Stack
        CIRCUIT.updateStack('push', val);

        UI.setCircuitState(box, 'call');

        // Move Cursor
        STATE.cursorY += 70;
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        return {x, y};
    },

    // Return Visualization (Right Side)
    drawReturn: (val, pos) => {
        const container = UTILS.get('canvasCircuit');
        const x = pos.x + 130; // Shift to Right
        const y = pos.y;       // Same Line

        // Box
        const box = document.createElement('div');
        box.className = 'circuit-box return';
        box.innerHTML = `RETURN⤴️ <span style="color:${CONFIG.colors.rose}">${val}</span>`;
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
        container.appendChild(box);
        UI.setCircuitState(box, 'return');


        // Horizontal Line
        UTILS.drawPolyLine([
            {x: pos.x + 90, y: y + 15},
            {x: x, y: y + 15}
        ], CONFIG.colors.rose, 'svgCircuitLayer', true);

        // Stack
        CIRCUIT.updateStack('pop');
    },

    updateStack: (action, val) => {
        const list = UTILS.get('stackList');
        const count = UTILS.get('stackCount');
        const empty = list.querySelector('.empty-state');
        if(empty) empty.remove();

        if(action === 'push') {
const el = document.createElement('div');
el.className = 'stack-frame call';
el.innerHTML = `
    <div>node = ${val}</div>
    <div>stage = CALL</div>
`;
list.appendChild(el);

} else {
    if (list.lastChild) {
        UI.setStackState(list.lastChild, 'return');
        setTimeout(() => {
            if (list.lastChild) list.lastChild.remove();
        }, 200);
    }
}

        
        count.innerText = `${list.children.length} FRAMES`;
    }
}

// ==========================================================================
// MODULE 4: MAIN RUNNER
// ==========================================================================
const APP = {
    build: () => {
        STATE.root = TREE_ENGINE.build();
        if(STATE.root) {
            TREE_ENGINE.calculateLayout(STATE.root);
            TREE_ENGINE.render(STATE.root);
            APP.generateData(STATE.root);
            CIRCUIT.init();
            const track = document.getElementById('flowTrack');
if (track) track.innerHTML = '';

        }
    },

    run: async () => {
        const track = document.getElementById('flowTrack');
if (track) track.innerHTML = '';
        if(!STATE.root || STATE.isRunning) return;
        STATE.isRunning = true;
        CIRCUIT.init();
        
        const algo = UTILS.get('algoType').value;
        const btn = UTILS.get('btnRun');
        btn.innerText = "RUNNING...";
        btn.classList.add('action');

        if(algo === 'bfs') await APP.bfs(STATE.root);
        else await APP.dfs(STATE.root, algo);

        STATE.isRunning = false;
        btn.innerText = "EXECUTE";
        btn.classList.remove('action');
    },

    // Recursive DFS Runner
// Recursive DFS Runner
dfs: async (node, type, depth = 0, pPos = null) => {
    if (!node || !STATE.isRunning) return;

    const dom = UTILS.get(`node-${node.id}`);

    // ─── CALL PHASE ─────────────────────
    UI.setNodeState(node.id, 'CALL');
    const pos = CIRCUIT.drawCall(node.val, depth, pPos);
    await UTILS.sleep(CONFIG.speed);

    // ─── PREORDER PROCESS ───────────────
    if (type === 'preorder') {
        UI.setNodeState(node.id, 'PROCESS');
        await UTILS.sleep(CONFIG.speed);
    }

    // ─── LEFT RECURSION ─────────────────
    if (node.left) {
        await APP.dfs(node.left, type, depth + 1, pos);
    }

    // ─── INORDER PROCESS ────────────────
    if (type === 'inorder') {
        UI.setNodeState(node.id, 'PROCESS');
        await UTILS.sleep(CONFIG.speed);
    }

    // ─── RIGHT RECURSION ────────────────
    if (node.right) {
        await APP.dfs(node.right, type, depth + 1, pos);
    }

    // ─── POSTORDER PROCESS ──────────────
    if (type === 'postorder') {
        UI.setNodeState(node.id, 'PROCESS');
        await UTILS.sleep(CONFIG.speed);
    }

    // ─── RETURN PHASE (UNWINDING) ───────
    UI.setNodeState(node.id, 'RETURN');
    CIRCUIT.drawReturn(node.val, pos);
    const track = document.getElementById('flowTrack');
if (track) {
    // dim old nodes
    track.querySelectorAll('.flow-node').forEach(n => n.classList.add('dim'));

    // add arrow if needed
    if (track.children.length > 0) {
        const arrow = document.createElement('div');
        arrow.className = 'flow-arrow';
        arrow.innerText = '→';
        track.appendChild(arrow);
    }

    // add new node
    const nodeEl = document.createElement('div');
    nodeEl.className = 'flow-node';
    nodeEl.innerText = node.val;
    track.appendChild(nodeEl);
    nodeEl.offsetHeight; 
}

    await UTILS.sleep(CONFIG.speed);

    UI.setNodeState(node.id, 'DONE');
},

    // Queue BFS Runner
   // Queue BFS Runner
bfs: async (root) => {
    let q = [{ n: root, d: 0, p: null }];

    while (q.length && STATE.isRunning) {
        const { n, d, p } = q.shift();
        const dom = UTILS.get(`node-${n.id}`);

        // CALL
        UI.setNodeState(n.id, 'CALL');
        const pos = CIRCUIT.drawCall(n.val, d, p);
        await UTILS.sleep(CONFIG.speed);

        // PROCESS (BFS processes immediately)
        UI.setNodeState(n.id, 'PROCESS');
        await UTILS.sleep(CONFIG.speed);

        // RETURN
        UI.setNodeState(n.id, 'RETURN');
        CIRCUIT.drawReturn(n.val, pos);
        await UTILS.sleep(CONFIG.speed);

        UI.setNodeState(n.id, 'DONE');

        if (n.left) q.push({ n: n.left, d: d + 1, p: pos });
        if (n.right) q.push({ n: n.right, d: d + 1, p: pos });
    }
},


    generateData: (root) => {
        let res = { pre:[], in:[], post:[], lvl:[] };
        
        const t = (n) => {
            if(!n) return;
            res.pre.push(n.val);
            t(n.left);
            res.in.push(n.val);
            t(n.right);
            res.post.push(n.val);
        };
        t(root);

        let q = [root];
        while(q.length) {
            let c = q.shift();
            if(c) {
                res.lvl.push(c.val);
                q.push(c.left);
                q.push(c.right);
            }
        }

        UTILS.get('outPre').value = JSON.stringify(res.pre);
        UTILS.get('outIn').value = JSON.stringify(res.in);
        UTILS.get('outPost').value = JSON.stringify(res.post);
        UTILS.get('outLevel').value = JSON.stringify(res.lvl);
    },

toggleTheme: () => {
    const body = document.body;
    const btn = document.getElementById('btnTheme');
    if (!btn) return;

    const isLab = body.getAttribute('data-theme') === 'lab';

    if (isLab) {
        body.removeAttribute('data-theme');
        btn.innerText = '☀︎';
    } else {
        body.setAttribute('data-theme', 'lab');
        btn.innerText = '☾';
    }
},

    
    importData: () => {
        const d = localStorage.getItem('treeData');
        if(d) {
            UTILS.get('rawInput').value = d;
            APP.build();
        }
    }
};

// INITIALIZE
window.APP = APP;
window.copyToClipboard = UTILS.copy;

document.addEventListener('DOMContentLoaded', () => {
    // Event Bindings
    UTILS.get('btnBuild').onclick = APP.build;
    UTILS.get('btnRun').onclick = APP.run;
    UTILS.get('btnImport').onclick = APP.importData;

    // Boot
    if(localStorage.getItem('treeData')) APP.importData();
    else APP.build();
});
APP.importData = () => {
    const data = localStorage.getItem('bt_array');

    if (!data) {
        alert('No previous array found');
        return;
    }

    UTILS.get('rawInput').value = data;
    APP.build();
};
// ================================
// GLOBAL RESET HELPERS (SAFE APPEND)
// ================================
const RESET = {
    all() {
        // clear tree node states
        document.querySelectorAll('.tree-node').forEach(n => {
            n.classList.remove(
                'node-call',
                'node-process',
                'node-return',
                'node-done'
            );
            n.removeAttribute('data-state');
        });

        // clear circuit boxes
        const circuit = document.getElementById('canvasCircuit');
        if (circuit) {
            circuit.querySelectorAll('.circuit-box').forEach(b => b.remove());
        }

        // clear circuit svg
        const svg = document.getElementById('svgCircuitLayer');
        if (svg) svg.innerHTML = '';

        // clear stack
        const stack = document.getElementById('stackList');
        if (stack) {
            stack.innerHTML = `<div class="empty-state">BUFFER_EMPTY</div>`;
        }

        // clear flow timeline
        const flow = document.getElementById('flowTrack');
        if (flow) flow.innerHTML = '';
    }
};
// ================================
// NULL CALL VISUALIZATION (BASE CASE)
// ================================
function visualizeNull(depth, parentPos) {
    const container = document.getElementById('canvasCircuit');
    if (!container) return;

    const x = 40 + (depth * 50);
    const y = STATE.cursorY;

    const box = document.createElement('div');
    box.className = 'circuit-box return';
    box.innerText = 'RET null';
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.style.opacity = '0.5';

    container.appendChild(box);

    if (parentPos) {
        UTILS.drawPolyLine(
            [
                { x: parentPos.x + 10, y: parentPos.y + 30 },
                { x: parentPos.x + 10, y: y + 15 },
                { x: x, y: y + 15 }
            ],
            CONFIG.colors.dim,
            'svgCircuitLayer',
            true
        );
    }

    STATE.cursorY += 50;
}
// ================================
// EXECUTION MODE (AUTO / STEP)
// ================================
const EXEC_MODE = {
    mode: 'auto', // 'auto' | 'step'
    resolver: null,

    async wait() {
        if (this.mode === 'auto') {
            await UTILS.sleep(CONFIG.speed);
        } else {
            await new Promise(res => this.resolver = res);
        }
    },

    step() {
        if (this.resolver) {
            this.resolver();
            this.resolver = null;
        }
    }
};
// ================================
// RECURSION DEPTH TRACKER
// ================================
const DEPTH = {
    current: 0,
    max: 0,

    enter() {
        this.current++;
        this.max = Math.max(this.max, this.current);
    },

    exit() {
        this.current = Math.max(0, this.current - 1);
    },

    reset() {
        this.current = 0;
        this.max = 0;
    }
};
OUTPUT.push(node.val);
// ================================
// RUN LIFECYCLE HOOKS
// ================================
function onRunStart() {
    RESET.all();
    DEPTH.reset();
    OUTPUT.clear();
    STATE.cursorY = 40;
}

function onRunEnd() {
    STATE.isRunning = false;
}



