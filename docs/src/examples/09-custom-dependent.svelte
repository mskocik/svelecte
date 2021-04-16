<script>
  let payload = null;

  function onSubmit(e) {
    const object = {};
    const formData = new FormData(e.target);
    formData.forEach((value, key) => object[key] = value);
    payload = JSON.stringify(object, null, 2);
  }
</script>

<form action="" on:submit|preventDefault={onSubmit}>

  <el-svelecte
    name="parent_value"
    options={`[{"value":"posts","text":"Posts"},{"value":"users","text":"Users"},{"value":"comments","text":"Comments"}]`}
    id="is-parent" required>
  </el-svelecte>
  <el-svelecte name="child_value" parent="is-parent" required
    fetch="https://jsonplaceholder.typicode.com/[parent]">
  </el-svelecte>
  <button type="submit" class="btn btn-success">Send form</button>
  {#if payload}
    <pre>{payload}</pre>
  {/if}
</form>