<script>
	import Svelecte from './Svelecte/Svelecte.svelte';

	let options = [
		{ value: 1, text: 'Hello' },
		{ value: 2, text: 'Bello' },
	];

</script>

<main>
	<Svelecte {options}></Svelecte>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 400px;
		margin: 2rem auto;
	}
</style>