<script>
  import { page } from '$app/stores';
  import { arrayProxy, superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import Svelecte from '$lib/Svelecte.svelte';

  export let data;

  const pageForm = superForm(data.form, {
    clearOnSubmit: 'none'
  })
  const { form, message, enhance } = pageForm;

  const options = data.options;

  // @ts-ignore
  const { values, errors } = arrayProxy(pageForm, 'tags', { taint: true });
</script>

<SuperDebug data={$form} />

<h3>Superforms multi-select component</h3>

{#if $message}
  <div class="status"
    class:error={$page.status >= 400}
    class:success={$page.status == 200}
  >
    {$message}
  </div>
{/if}

<h3>{$values}</h3>

<form method="POST" use:enhance>
  <label for="sv-select-tags-input">Pick a color</label>
  <Svelecte {options} name="tags" bind:value={$values} clearable required multiple/>
  
  {#if $errors}<p class="invalid">{$errors}</p>{/if}

  <div>
    <button type="submit">Submit</button>
  </div>
</form>

<hr>
<p><a target="_blank" href="https://superforms.rocks/api">API Reference</a></p>

<style>
  .status {
    color: white;
    padding: 4px;
    padding-left: 8px;
    border-radius: 2px;
    font-weight: 500;
  }

  .status.success {
    background-color: seagreen;
  }

  .status.error {
    background-color: #ff2a02;
  }

  a {
    text-decoration: underline;
  }
  .invalid {
    color: crimson;
  }

  hr {
    margin-top: 4rem;
  }

  form {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
