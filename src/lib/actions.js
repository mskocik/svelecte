const mouseDownAction = e => e.preventDefault();

export default function(node, {item, index}) {

  function selectAction(e) {
    const eventType = e.target.closest('[data-action="deselect"]') ? 'deselect' : 'select';
    node.dispatchEvent(new CustomEvent(eventType, {
      bubble: true,
      detail: item
    }));
  }

  function hoverAction() {
    node.dispatchEvent(new CustomEvent('hover', {
      detail: index
    }));
  }
  node.onmousedown = mouseDownAction;
  node.onclick = selectAction;
  // !item.isSelected && 
  node.addEventListener('mouseenter', hoverAction);

  return {
    update(updated) {
      item = updated.item;
      index = updated.index;
    },
    destroy() {
      node.removeEventListener('mousedown', mouseDownAction);
      node.removeEventListener('click', selectAction);
      // !item.isSelected && 
      node.removeEventListener('mouseenter', hoverAction);
    }
  }
}
