/**
 * @typedef {object} ExtButton
 * @property {object?} [bound_item]
 *
 * @param {HTMLElement & ExtButton} node
 * @param {object} selectedObject
 */
export function bindItem(node, selectedObject) {
  node.bound_item = selectedObject;

  return {
    destroy: () => {}
  }
}
