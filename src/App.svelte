<script>
	import Svelecte from './Svelecte/Svelecte.svelte';

	let options = [
		{ value: 1, text: 'Hello' },
		{ value: 2, text: 'Bello' },
	];

	let options2 = [
		{ value: 1, text: 'Hello' },
		{ value: 2, text: 'Bello' },
	];

</script>

<main>
	<Svelecte {options} class="svelecte-control test"></Svelecte>
	<Svelecte options={options2} style="margin-top:2rem"></Svelecte>
</main>

<style>
	main {
		text-align: center;
		max-width: 400px;
		margin: 2rem auto;
	}
</style>