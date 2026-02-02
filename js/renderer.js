/* ================================
   TREE RENDERER (WITH SVG EDGES)
================================ */

const treeCanvas = document.getElementById("treeCanvas");
const treeNodesContainer = document.getElementById("treeNodes");
const treeEdges = document.getElementById("treeEdges");

/* ================================
   CLEAR CANVAS
================================ */
function clearTreeCanvas() {
    treeNodesContainer.innerHTML = "";

    // 🔥 IMPORTANT: remove only paths, NOT <defs>
    treeEdges.querySelectorAll("path").forEach(p => p.remove());
}


/* ================================
   RENDER TREE
================================ */
function renderTree(root) {
    clearTreeCanvas();
    if (!root) return;

    const rootEl = createNodeElement(root);
    treeNodesContainer.appendChild(rootEl);

    // Delay edges so DOM layout settles

    requestAnimationFrame(() => {
            window.__lastRenderedRootEl = rootEl;

    syncSvgWithTree();
    drawEdges(rootEl);
});

}

/* ================================
   CREATE NODE ELEMENT
================================ */
function createNodeElement(node) {
    const wrapper = document.createElement("div");
    wrapper.className = "tree-node-wrapper";

    const nodeEl = document.createElement("div");
    nodeEl.className = "tree-node";
    nodeEl.textContent = node.value;
    nodeEl.dataset.nodeId = node.id;


    wrapper.appendChild(nodeEl);

    // CHILDREN CONTAINER
    const children = document.createElement("div");
    children.className = "tree-children";

 // LEFT SLOT
const leftSlot = document.createElement("div");
leftSlot.className = "child-slot left-slot";

if (node.left) {
    const leftChild = createNodeElement(node.left);
    leftChild.dataset.side = "left";
    leftSlot.appendChild(leftChild);
} else {
    // EMPTY PLACEHOLDER (IMPORTANT)
    const placeholder = document.createElement("div");
    placeholder.className = "child-placeholder";
    leftSlot.appendChild(placeholder);
}

// RIGHT SLOT
const rightSlot = document.createElement("div");
rightSlot.className = "child-slot right-slot";

if (node.right) {
    const rightChild = createNodeElement(node.right);
    rightChild.dataset.side = "right";
    rightSlot.appendChild(rightChild);
} else {
    // EMPTY PLACEHOLDER (IMPORTANT)
    const placeholder = document.createElement("div");
    placeholder.className = "child-placeholder";
    rightSlot.appendChild(placeholder);
}



    children.appendChild(leftSlot);
    children.appendChild(rightSlot);

    // Append children container only if at least one child exists
    if (node.left || node.right) {
        wrapper.appendChild(children);
    }

    return wrapper;
}


/* ================================
   DRAW SVG EDGES
================================ */
function drawEdges(parentWrapper) {
    const parentNode = parentWrapper.querySelector(":scope > .tree-node");
    if (!parentNode) return;

    const canvasRect = treeCanvas.getBoundingClientRect();
    const parentRect = parentNode.getBoundingClientRect();

    const parentX = parentRect.left - canvasRect.left + parentRect.width / 2;
    const parentY = parentRect.top - canvasRect.top + parentRect.height;

    const leftSlot = parentWrapper.querySelector(":scope > .tree-children > .left-slot");
    const rightSlot = parentWrapper.querySelector(":scope > .tree-children > .right-slot");

    // LEFT CHILD EDGE
    if (leftSlot && leftSlot.firstElementChild) {
        const childWrapper = leftSlot.firstElementChild;
        drawSingleEdge(parentX, parentY, childWrapper, "left");
        drawEdges(childWrapper); // recurse ONLY to direct child
    }

    // RIGHT CHILD EDGE
    if (rightSlot && rightSlot.firstElementChild) {
        const childWrapper = rightSlot.firstElementChild;
        drawSingleEdge(parentX, parentY, childWrapper, "right");
        drawEdges(childWrapper);
    }
}
function drawSingleEdge(parentX, parentY, childWrapper, side) {
    const childNode = childWrapper.querySelector(":scope > .tree-node");
    if (!childNode) return;

    const canvasRect = treeCanvas.getBoundingClientRect();
    const childRect = childNode.getBoundingClientRect();

    const childX = childRect.left - canvasRect.left + childRect.width / 2;
    const childY = childRect.top - canvasRect.top;

    const bend = side === "left" ? -60 : 60;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    const d = `
        M ${parentX} ${parentY}
        C ${parentX + bend} ${parentY + 40},
          ${childX - bend} ${childY - 40},
          ${childX} ${childY}
    `;

    path.setAttribute("d", d);
    path.setAttribute("stroke", "#9ca3af");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("marker-end", "url(#arrowHead)");

    treeEdges.appendChild(path);
}


/* ================================
   EXPORT
================================ */
window.renderTree = renderTree;
/* ================================
   GET ALL NODE ELEMENTS
================================ */
function getAllNodeElements() {
    return document.querySelectorAll(".tree-node");
}

window.getAllNodeElements = getAllNodeElements;


function syncSvgWithTree() {
    const treeNodes = document.getElementById("treeNodes");
    const svg = document.getElementById("treeEdges");

    const rect = treeNodes.getBoundingClientRect();

    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.setAttribute(
        "viewBox",
        `0 0 ${rect.width} ${rect.height}`
    );
}
