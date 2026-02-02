/* ================================
   BINARY TREE DATA STRUCTURE
   This file is responsible for:
   - Node definition
   - Tree creation
   - Building tree from array (level order)
   NOTE:
   - No DOM access here
   - Pure logic only
================================ */

/* ================================
   NODE CLASS
================================ */
let NODE_ID_COUNTER = 0;

class TreeNode {
    constructor(value) {
        this.id = NODE_ID_COUNTER++;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}


/* ================================
   BINARY TREE CLASS
================================ */
class BinaryTree {
    constructor() {
        this.root = null;
    }

    /* ================================
       BUILD TREE FROM ARRAY
       Array represents LEVEL ORDER traversal
       Example: [1, 2, 3, null, 4]
    ================================ */
    buildFromArray(array) {
        if (!Array.isArray(array) || array.length === 0) {
            this.root = null;
            return;
        }

        // Create root
        this.root = new TreeNode(array[0]);

        const queue = [this.root];
        let index = 1;

        while (queue.length > 0 && index < array.length) {
            const currentNode = queue.shift();

            // Left child
            if (array[index] !== null && array[index] !== undefined) {
                currentNode.left = new TreeNode(array[index]);
                queue.push(currentNode.left);
            }
            index++;

            if (index >= array.length) break;

            // Right child
            if (array[index] !== null && array[index] !== undefined) {
                currentNode.right = new TreeNode(array[index]);
                queue.push(currentNode.right);
            }
            index++;
        }
    }

    /* ================================
       CLEAR TREE
    ================================ */
    clear() {
        this.root = null;
    }
}

/* ================================
   EXPORT TO GLOBAL SCOPE
   (So other JS files can use it)
================================ */
window.TreeNode = TreeNode;
window.BinaryTree = BinaryTree;
