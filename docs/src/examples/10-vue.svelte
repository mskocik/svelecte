<script>
  import { onMount, tick } from 'svelte';
  import { dataset } from './../data';
  
  onMount(() => {
    tick().then(() => {

      new Vue({
        el: '#vue',
        data: {
          placeholder: 'Select or create color',
          selected: [],
          opts: JSON.stringify(dataset.colors())
        },
        methods: {
          onChange: function(e) {
            this.selected = e.target.value;
          }
        },
        template: `<div>
          <h6>Vue 2 example</h6>
          <div>
            <el-svelecte :options="opts"  @change="onChange"
              :value="selected"
              :placeholder="placeholder"
              value-field="hex"
              multiple creatable
            ></el-svelecte>
          </div>
          <div>Selection: {{ selected }}</div>
        </div> `
      });
    });
  })
</script>

<div class="example-wrap" style="border-color: #41b883; box-shadow: 0 0 10px #41b883 inset">
  <div id="vue"></div>
</div>