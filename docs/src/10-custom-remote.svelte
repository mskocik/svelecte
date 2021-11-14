<script>
  let payload = null;

  function onSubmit(e) {
    const object = {};
    const formData = new FormData(e.target);
    formData.forEach((value, key) => {
      if (object[key]) {
        object[key] += ', ' + value;
        return;
      }
      object[key] = value
    });
    payload = JSON.stringify(object, null, 2);
  }

  function resetPayload(e) {
    payload = null;
  }
</script>


<form action="" on:submit|preventDefault={onSubmit}>
  <el-svelecte name="selection"
    on:change={resetPayload}
    multiple
    required
    placeholder="Search for color"
    fetch="https://my-json-server.typicode.com/mskocik/svelecte-docs/colors?value_like=[query]">
  </el-svelecte>
  <div class="mt-2">
    <button type="submit" class="btn btn-success">Send form</button>
  </div>
  {#if payload}
    <pre>{payload}</pre>
  {/if}
</form>