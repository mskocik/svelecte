<script>
	import Svelecte from './Svelecte/Svelecte.svelte';
	import { dataset } from './demo/data.js';

	const options = dataset.countries();
	const groups = dataset.countryGroups();

	let maxItems = 2;
	let multiple = false;
	let searchable = true;
	let creatable = true;

</script>

<main>
	<div class="form-row">
		<input type="text">
	</div>
	<div class="form-row">
		<div style="display: flex; justify-content: space-between">
			<div>
				<button on:click={() => --maxItems}>-</button>
				{maxItems}
				<button on:click={() => ++maxItems}>+</button>
			</div>
			<label><input type="checkbox" bind:checked={searchable}>Searchable</label>
			<label><input type="checkbox" bind:checked={creatable}>Createable</label>
			<label><input type="checkbox" bind:checked={multiple}>Multiple</label>
		</div>
		<Svelecte {options} class="svelecte-control test" max={maxItems} {multiple} {searchable} {creatable} delimiter=",;"></Svelecte>
	</div>
	<div class="form-row">
		<input type="text">
	</div>
	<div class="form-row">
		<Svelecte fetch="api.php?query=[query]" multiple>
			<b slot="icon">🎨</b>
		</Svelecte>
	</div>
	<div class="form-row">
		<input type="text">
	</div>
</main>

<style>
	:global(.icon-slot b) {
		font-family: 'Fira Code';
		margin-left: 0.5rem;
	}
	input {
		width: 100%;
		margin-bottom: 0;
	}
	.form-row {
		margin-bottom: 2rem;
		min-height: 20px;
	}
	.form-row:focus-within {
		box-shadow: 0 0 10px #ccc;
	}
	main {
		text-align: center;
		max-width: 400px;
		margin: 2rem auto;
	}
	:global(.optgroup-header) {
		text-align: left;
	}
</style>