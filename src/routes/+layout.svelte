<script context="module">
  import Svelecte from "$lib/Svelecte.svelte";
</script>

<div class="main-container">
  <slot />
</div>

<style>
  .main-container {
    width: 500px;
    margin: 2rem auto;
  }
</style>
