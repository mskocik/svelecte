<script>
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import Svelecte from '$lib/Svelecte.svelte';

  let {
    data,status
  } = $props();

  const pageForm = superForm(data.form, {
    clearOnSubmit: 'none',
    resetForm: false
  })
  const { form, message, enhance, errors } = pageForm;

</script>

{#if $message}
  <div class="status"
    class:error={status.status >= 400}
    class:success={status.status == 200}
  >
    {@html $message}
  </div>
{/if}

<form method="POST" use:enhance novalidate>
  <fieldset>
    <legend>Superform</legend>
  <label for="sv-tags-select-input">
    Pick your <b>favorite</b> color
  </label>
  <!-- <Svelecte fetch="http://localhost:5173/api/colors?query=[query]" name="favourite" bind:value={$form.favourite} clearable required placeholder="Search for the best color" /> -->
  <!-- <Svelecte creatable name="favourite" bind:value={$form.favourite} clearable placeholder="Search for the best color" /> -->
  <Svelecte
        name="favourite"
			  fetch="/api/colors?query=[query]"
			  minQuery={2}
			  creatable={true}
			  keepCreated={true}
			  creatablePrefix=""
			  allowEditing={true}
			  valueField="value"
			  labelField="value"
			  placeholder="Pick color from database or enter your own"
			  strictMode={false}
			  bind:value={$form.favourite}
		  />
  <br>
  <label for="sv-tags-select-input">
    Pick some other (multiple) colors. At least 2. <span class="invalid" style="margin-left: 0">*</span>
  </label>
  <Svelecte fetch="/api/colors?query=[query]"
    name="tags"
    bind:value={$form.tags} multiple clearable required placeholder="Search for color" />
  <br>
  <div>
    <button type="submit" class="press-btn">Submit</button>
    {#if $errors}<span class="invalid">{$errors.tags?._errors}</span>{/if}
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
