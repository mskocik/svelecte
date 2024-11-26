<script>
  import { arrayProxy, superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import Svelecte from '$lib/Svelecte.svelte';

  /** @type {{data: any, status: any}} */
  let { data, status } = $props();

  const pageForm = superForm(data.form, {
    clearOnSubmit: 'none'
  })
  const { form, message, enhance } = pageForm;

  const options = data.options;

  // @ts-ignore
  const { values, errors } = arrayProxy(pageForm, 'tags', { taint: true });
</script>

{#if $message}
  <div class="status"
    class:error={status.status >= 400}
    class:success={status.status == 200}
  >
    {$message}
  </div>
{/if}

<form method="POST" use:enhance>
  <fieldset>
    <legend>Superform</legend>
  <label for="sv-tags-select-input">
    Pick a color
  </label>
  <Svelecte {options} name="tags" bind:value={$values} clearable required multiple/>
  <br>
  <div>
    <button type="submit" class="press-btn">Submit</button>
    {#if $errors}<span class="invalid">{$errors}</span>{/if}
  </div>
</fieldset>
</form>
<SuperDebug data={$form} />
<br>
<p><a target="_blank" href="https://superforms.rocks/api">Superforms API Reference</a></p>


<style>
  .status {
    color: white;
    padding: 4px;
    padding-left: 8px;
    border-radius: 2px;
    font-weight: 500;
    padding: 32px;
  }

  .status.success {
    background-color: seagreen;
  }

  fieldset, legend {
    padding: 12px;
  }
  legend {
    padding: 6px 12px;
    border: 1px solid white;
  }

  .status.error {
    background-color: #ff2a02;
  }

  a {
    text-decoration: underline;
  }
  .invalid {
    color: crimson;
    margin: 0 20px;
  }
  .press-btn {
    background-color: var(--vp-c-brand-2);
    padding: 8px 12px;
    border-radius: 4px;
  }

  form {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
