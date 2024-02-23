<script>
  import { page } from '$app/stores';
  import SuperForm from './SuperForm.svelte';
  import UseForm from './UseForm.svelte';

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

<hr>

# Integration with `svelte-use-form`

```svelte
<script>
	import { useForm, validators, Hint, required } from 'svelte-use-form';

  const form = useForm();

	function noBlack(val) {
		if (val === 'black') return { noBlack: true }
	}
</script>

<form use:form>
  <Svelecte name="color"
    required
    validatorAction={[validators, required, noBlack]}
  />

	<div class="hint-space">
		<Hint for="color" on="required" showWhenUntouched >
			<i>Color is required!</i>
		</Hint>
		<Hint for="color" on="noBlack">
			<span class="err">Please select something else than <i>black</i></span>
		</Hint>
		{#if $form.valid}
			<span style="color: green">You may now pass!</span>
		{/if}
	</div>

	<button type="submit" class="press-btn">Send form</button>
</form>
```

<UseForm />
