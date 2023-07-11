<button class="sv-item-btn" tabindex="-1" data-action="deselect" type="button">
  <svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
</button>

<style>
  .sv-item-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    align-self: stretch;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: 2px;
    border-width: 0;
    margin: 0;
    cursor: pointer;
    background-color: var(--sv-item-btn-bg, var(--sv-item-selected-bg));
  }
  .sv-item-btn:hover {
    background-color: var(--sv-item-btn-bg-hover);
  }
  .sv-item-btn > svg {
    fill: var(--sv-item-btn-icon, var(--sv-icon-color));
  }
</style>