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
</script>


<form action="" on:submit|preventDefault={onSubmit}>
  <el-svelecte
    name="parent_value" placeholder="Select parent value"
    options={`[{"value":"posts","text":"Posts"},{"value":"users","text":"Users"},{"value":"comments","text":"Comments"}]`}
    id="is-parent" required="required">
  </el-svelecte>
  <el-svelecte name="child_value" parent="is-parent" required="required" placeholder="Pick from child select"
    fetch="https://jsonplaceholder.typicode.com/[parent]" on:change={e => console.log('D', e.detail)}>
  </el-svelecte>
  <!-- server-side rendered -->
  <div>Server-side rendered inner select:</div>
  <el-svelecte options={`[{"id":"posts,x","label":"Posts", "prop": "Posts"},{"id":"users","label":"Users", "prop": "Users"},{"id":"comments","label":"Comments", "prop": "Comment"}]`}
    style="margin-bottom: 0"
    lazy-dropdown="false"
    multiple
    reset-on-select="false"
    value-delimiter="|"
  >
    <select id="anchored" name="demo" multiple on:change={e => console.log(e.target.selectedOptions)}></select>
  </el-svelecte>
  <small>This <code>&lt;el-svelecte&gt;</code> has nested (anchored) <code>&lt;select&gt;</code>, when you <em>need</em> to have it rendered server-side. This setup is specific, 
    because inner select needs to have <code>name</code> and <code>required</code> (if applicable) properties specified manually. (They are not inherited from el-svelecte parent)</small>
  <div class="mt-2">
    <button type="submit" class="btn btn-success">Send form</button>
  </div>
  {#if payload}
    <pre>{payload}</pre>
  {/if}
</form>