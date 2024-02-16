<script>
	import Svelecte from '$lib/Svelecte.svelte';
	import { useForm, validators, Hint, required } from 'svelte-use-form';
	
	import { dataset } from '../../data.js';		
	
	const form = useForm();
	let showSubmit = false;
	
	function noBlack(val) {
		if (val === 'black') return { noBlack: true }
	}
	
	function onSubmit() {
		showSubmit = true;
		setTimeout(() => { showSubmit = false}, 5000);
	}
</script>

<section>
<form use:form on:submit|preventDefault={onSubmit}>
	<h3>My Form</h3>
	<p>
		Select some color, but <b>black</b> is not allowed.
	</p>

	<Svelecte
	  name="color"
		required
		options={dataset.colors()}
		validatorAction={[validators, required, noBlack]}
	  clearable
	></Svelecte>

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
	<button type="submit" disabled={!$form.valid}>Send form</button>
</form>

{#if showSubmit}
<div class="info">
	Form submitted;
</div>
{/if}
</section>

<style>
	section {
		width: 400px;
	}
	.hint-space {
		min-height: 24px;
	}
	.err {
		color: red;
	}
	.info {
		background-color: #ff0;
		padding: 1rem;
		border-radius: 3px;
	}
</style>
