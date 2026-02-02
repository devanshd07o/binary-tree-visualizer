/* ================================
   TREE TRAVERSAL ALGORITHMS
   This file is responsible for:
   - Inorder traversal
   - Preorder traversal
   - Postorder traversal
   - Level order traversal
   NOTE:
   - No DOM access here
   - Works only with TreeNode structure
================================ */

/* ================================
   INORDER TRAVERSAL
   Left → Root → Right
================================ */
function inorderTraversal(root) {
    const result = [];

    function traverse(node) {
        if (!node) return;

        traverse(node.left);
        result.push(node);
        traverse(node.right);
    }

    traverse(root);
    return result;
}

/* ================================
   PREORDER TRAVERSAL
   Root → Left → Right
================================ */
function preorderTraversal(root) {
    const result = [];

    function traverse(node) {
        if (!node) return;

        result.push(node);
        traverse(node.left);
        traverse(node.right);
    }

    traverse(root);
    return result;
}

/* ================================
   POSTORDER TRAVERSAL
   Left → Right → Root
================================ */
function postorderTraversal(root) {
    const result = [];

    function traverse(node) {
        if (!node) return;

        traverse(node.left);
        traverse(node.right);
        result.push(node);
    }

    traverse(root);
    return result;
}

/* ================================
   LEVEL ORDER TRAVERSAL (BFS)
================================ */
function levelOrderTraversal(root) {
    const result = [];

    if (!root) return result;

    const queue = [root];

    while (queue.length > 0) {
        const currentNode = queue.shift();
        result.push(currentNode);

        if (currentNode.left) {
            queue.push(currentNode.left);
        }

        if (currentNode.right) {
            queue.push(currentNode.right);
        }
    }

    return result;
}

/* ================================
   EXPORT TO GLOBAL SCOPE
================================ */
window.inorderTraversal = inorderTraversal;
window.preorderTraversal = preorderTraversal;
window.postorderTraversal = postorderTraversal;
window.levelOrderTraversal = levelOrderTraversal;
