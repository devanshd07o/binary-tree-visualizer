/* ================================
   CONTROLS HANDLER
   Responsible for:
   - Reading user input
   - Building tree from array
   - Triggering render
   NOTE:
   - Traversal controls later
================================ */
let traversalTimer = null;
let traversalSpeed = 800; // milliseconds
let isPaused = true;

let activePlaceholder = null;


/* ================================
   DOM REFERENCES
================================ */
const speedSlider = document.getElementById("speedSlider");
const arrayInput = document.getElementById("arrayInput");
const buildTreeBtn = document.getElementById("buildTreeBtn");
const arrayInputError = document.getElementById("arrayInputError");
const pauseBtn = document.getElementById("pauseTraversalBtn");
const stepBtn = document.getElementById("stepTraversalBtn");
const resetBtn = document.getElementById("resetTraversalBtn");
const traversalStatus = document.getElementById("traversalStatus");

// ===== Input Mode Toggle (Array / Visual) =====
// const arrayInputSection = document.getElementById("arrayInputSection");
// const visualBuilderSection = document.getElementById("visualBuilderSection");
// get radios by name (IMPORTANT)
// const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
////////////////////////////
// ===== Visual Builder / Traversal shared tree =====
////////////////////////////
// function updateInputModeUI() {
//     let selectedMode = "array";
//     inputModeRadios.forEach(radio => {
//         if (radio.checked) {
//             selectedMode = radio.value;
//         }
//     });
//     if (selectedMode === "array") {
//         arrayInputSection.style.display = "block";
//         visualBuilderSection.style.display = "none";
//     } else {
//         arrayInputSection.style.display = "none";
//         visualBuilderSection.style.display = "block";
//     }
// initial state on page load
// updateInputModeUI();
// // listen for change
// inputModeRadios.forEach(radio => {
//     radio.addEventListener("change", updateInputModeUI);
// });






speedSlider.addEventListener("input", () => {
    traversalSpeed = Number(speedSlider.value);

    // agar traversal chal raha hai, timer restart karo
    if (traversalTimer && !isPaused) {
        clearInterval(traversalTimer);
        startTraversalEngine();
    }
});

/* ================================
   TREE INSTANCE
================================ */
let binaryTree = new BinaryTree();

/* ================================
   HELPER: INPUT ERROR
================================ */
function showError(message) {
    arrayInputError.textContent = message;
}


/* ================================
   BUILD TREE BUTTON HANDLER
================================ */
buildTreeBtn.addEventListener("click", () => {

    // Clear previous error
    arrayInputError.textContent = "";

    const input = arrayInput.value;
    const arr = smartParseArray(input);

    if (!arr) {
        showError("Invalid array input");
        return;
    }

    // Build tree
    binaryTree.clear();
    binaryTree.buildFromArray(arr);

    // Render tree
    renderTree(binaryTree.root);
    // traversal state reset on tree rebuild
stopTraversal();
resetNodeStates();

traversalSteps = [];
currentStepIndex = 0;
isPaused = true;

outputBox.textContent = "";

startBtn.disabled = false;
pauseBtn.disabled = true;
stepBtn.disabled = true;
resetBtn.disabled = true;
});
/* ================================
   TRAVERSAL CONTROLS (BASIC)
================================ */

const traversalTypeSelect = document.getElementById("traversalType");
const startBtn = document.getElementById("startTraversalBtn");
const outputBox = document.getElementById("traversalOutput");

let traversalSteps = [];
let currentStepIndex = 0;

/* ================================
   CLEAR NODE STATES
================================ */
function resetNodeStates() {
    getAllNodeElements().forEach(node => {
        node.classList.remove("active", "visited");
    });
}

/* ================================
   START TRAVERSAL
================================ */
startBtn.addEventListener("click", () => {
    if (!binaryTree.root) return;

    stopTraversal();
    resetNodeStates();
    outputBox.textContent = "";

    const type = traversalTypeSelect.value;

    if (type === "inorder") {
        traversalSteps = inorderTraversal(binaryTree.root);
    } else if (type === "preorder") {
        traversalSteps = preorderTraversal(binaryTree.root);
    } else if (type === "postorder") {
        traversalSteps = postorderTraversal(binaryTree.root);
    } else if (type === "levelorder") {
        traversalSteps = levelOrderTraversal(binaryTree.root);
    }

    currentStepIndex = 0;
    isPaused = false;

    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    stepBtn.disabled = true;

    startBtn.disabled = true;

    startTraversalEngine();
});


/* ================================
   STEP TRAVERSAL
================================ */
function stepTraversal() {
    // END CONDITION
    if (currentStepIndex >= traversalSteps.length) {
        // mark last node as visited
        const lastNode = traversalSteps[traversalSteps.length - 1];
        getAllNodeElements().forEach(domNode => {
            if (domNode.dataset.nodeId == lastNode.id) {
                domNode.classList.remove("active");
                domNode.classList.add("visited");
            }
        });
        
stopTraversal();

pauseBtn.disabled = true;
stepBtn.disabled = true;
startBtn.disabled = true;

resetBtn.disabled = false;

return;

    }

    const currentNode = traversalSteps[currentStepIndex];
    const currentId = currentNode.id;

    // Clear active state
    getAllNodeElements().forEach(node => {
        node.classList.remove("active");
    });

    // Activate current node
    getAllNodeElements().forEach(domNode => {
        if (domNode.dataset.nodeId == currentId) {
            domNode.classList.add("active");
        }
    });

    // Mark previous node as visited
    if (currentStepIndex > 0) {
        const prevNode = traversalSteps[currentStepIndex - 1];
        const prevId = prevNode.id;

        getAllNodeElements().forEach(domNode => {
            if (domNode.dataset.nodeId == prevId) {
                domNode.classList.remove("active");
                domNode.classList.add("visited");
            }
        });
    }

    // Output update (use value only for display)

    traversalStatus.textContent = "Current: — | Visited: —";

    outputBox.textContent += currentNode.value + " ";
const visitedValues = traversalSteps
    .slice(0, currentStepIndex)
    .map(n => n.value)
    .join(" → ");

traversalStatus.textContent =
    "Current: " + currentNode.value +
    " | Visited: " + (visitedValues || "—");

    currentStepIndex++;

}
function startTraversalEngine() {
    traversalTimer = setInterval(() => {
        if (isPaused) return;
        stepTraversal();
    }, traversalSpeed);
}


function stopTraversal() {
    if (traversalTimer) {
        clearInterval(traversalTimer);
        traversalTimer = null;
    }
    isPaused = true;
    startBtn.disabled = !binaryTree.root;
pauseBtn.disabled = true;
stepBtn.disabled = true;

}

pauseBtn.addEventListener("click", () => {
    isPaused = true;

    pauseBtn.disabled = true;
    stepBtn.disabled = false;
});
stepBtn.addEventListener("click", () => {
    isPaused = true;
    stepTraversal();
});
resetBtn.addEventListener("click", () => {
    stopTraversal();
    resetNodeStates();

    traversalSteps = [];
    currentStepIndex = 0;
    isPaused = true;

    outputBox.textContent = "";

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    resetBtn.disabled = true;
});


/* =========================================================
   🔥 EDGE DIRECTION HIGHLIGHT (CALL / RETURN)
========================================================= */

function highlightCallEdge(parentId, childId) {
    document.querySelectorAll(".tree-edges path").forEach(p => {
        if (
            p.dataset.parent == parentId &&
            p.dataset.child == childId
        ) {
            p.classList.remove("return-edge");
            p.classList.add("call-edge");
        }
    });
}

function highlightReturnEdge(parentId, childId) {
    document.querySelectorAll(".tree-edges path").forEach(p => {
        if (
            p.dataset.parent == parentId &&
            p.dataset.child == childId
        ) {
            p.classList.remove("call-edge");
            p.classList.add("return-edge");
        }
    });
}

function clearEdgeHighlights() {
    document.querySelectorAll(".tree-edges path").forEach(p => {
        p.classList.remove("call-edge", "return-edge");
    });
}
function launchRecursionLab() {
    // 1. Get the current input value (Assuming input ID is 'arrayInput')
    const currentArray = document.getElementById('arrayInput').value;

    // 2. Save it to LocalStorage so the new page can read it
    localStorage.setItem('treeData', currentArray);

    // 3. Open the new page (Make sure recursion.html is in the recursion folder)
    window.open('recursion/recursion.html', '_blank');
}