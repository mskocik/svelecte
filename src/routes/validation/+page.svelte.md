<script>
  import { page } from '$app/stores';
  import SuperForm from './SuperForm.svelte';

  export let data;
</script>

# Integration with `sveltekit-superforms`

You can use superforms out of the box.

```svelte
<script>
  import { arrayProxy, superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import Svelecte from '$lib/Svelecte.svelte';

  const options = [/* some options */];

  const pageForm = superForm(data.form, {
    clearOnSubmit: 'none'
  })
  const { form, message, enhance } = pageForm;
  // @ts-ignore
  const { values, errors } = arrayProxy(pageForm, 'tags', { taint: true });
</script>

<form method="POST" use:enhance>
  <Svelecte {options} name="tags" bind:value={$values} multiple/>
  <button type="submit" class="press-btn">Submit</button>
  {#if $errors}<span class="invalid">{$errors}</span>{/if}
</form>
```

<SuperForm {data} status={$page.status}/>
