<script>
	import Svelecte from './Svelecte/Svelecte.svelte';
	import { dataset } from './demo/data.js';

	const options = dataset.countries();
	const groups = dataset.countryGroups();

</script>

<main>
	<div class="form-row">
		<input type="text">
	</div>
	<div class="form-row">
		<Svelecte {options} class="svelecte-control test"></Svelecte>
	</div>
	<div class="form-row">
		<input type="text">
	</div>
	<div class="form-row">
		<Svelecte options={groups}></Svelecte>
	</div>
	<div class="form-row">
		<input type="text">
	</div>
</main>

<style>
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