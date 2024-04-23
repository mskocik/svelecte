<script>
	export let item
</script>

<div>
	{item.$selected ? '👌' : '👉'} {item.text} {item.$selected ? '✅' : '☑️'}
</div>
