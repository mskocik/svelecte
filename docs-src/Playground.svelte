<script>
	import Svelecte from './../src/svelecte.js';
	import { dataset } from './data.js';

	let options = dataset.countries();
	const groups = dataset.countryGroups();

	let maxItems = 2;
	let multiple = false;
	let searchable = true;
	let creatable = true;

	let remoteValue = 'json';

	const remotes = {
		colors: 'https://my-json-server.typicode.com/mskocik/svelecte-db/colors?value_like=[query]',
		json: 'https://jsonplaceholder.typicode.com/users/'
	}
	const slots = {
		opts: '🎨',
		countries: '🌍',
		colors: '⚡',
		json: '🙋'
	}

	let settings = {};
	$: slot = slots[remoteValue];

	$: {
		if (remoteValue === 'opts') {
			settings = {
				options: dataset.colors(),
				fetch: null,
				placeholder: 'Pick your color'
			}
		} else if (remoteValue === 'countries') {
			settings = {
				options: dataset.countries(),
				fetch: null,
				placeholder: 'Choose your favourite European country'
			}
		} else {
			settings = {
				fetch: remotes[remoteValue],
				fetchCallback: remoteValue === 'json' ? fetchCallback : null,
				placeholder: remoteValue === 'colors' ? 'Search for color' : 'Select from prefetched list',
				options: []
			}
		}
	}

	function fetchCallback(resp) {
		return resp.map(user => {
			return {
				id: user.id,
				street: `${user.address.street} ${user.address.suite}`,
				city: user.address.city,
				email: user.email
			}
		});
	}

</script>

<details>
	<summary>Previous app</summary>
<main>
	<!--
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
		<Svelecte {options} class="svelecte-control test" max={maxItems} {multiple} {searchable} {creatable} delimiter=";"></Svelecte>
		<button on:click={() => options = dataset.countryGroups()}>Switch Source</button>
	</div>
-->
	<select bind:value={remoteValue}>
		<option value="opts">🎨 colors</option>
		<option value="countries">🌍 countries</option>
		<option value="colors">API: Colors</option>
		<option value="json">API: User list</option>
	</select>
	<div class="form-row">
		<Svelecte {...settings}>
			<b slot="icon">{slot}</b>
		</Svelecte>
	</div>
</main>
</details>

<hr>

<h1 id="sub-getting-started">Getting started</h1>

<p>
	Svelecte provide basically every common functionality, you would expect from autocomplete/select component. It's main inspiration was selectize.js
</p>

<h2>Installation</h2>

<pre>
npm install svelecte --save
</pre>

<h3>Basic Usage</h3>

<Svelecte {options}></Svelecte>

<details>
	<summary>Show code</summary>
</details>

<h3>Option groups</h3>

<Svelecte options={groups}></Svelecte>

Optgroups are distinguished by <code>label</code> property. And options are expected to be found under <code>options</code> property.

<details>
	<summary>Show code</summary>
</details>

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
	details {
		margin-top: 1rem;
	}
	summary {}
</style>