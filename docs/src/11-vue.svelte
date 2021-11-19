<script>
  import { onMount, tick } from 'svelte';
  import { dataset } from './data';

  /**
   * because we set svelecte to use `label-as-value`, we need to transform entered value
   * to have FIRST letter uppercase, the rest lowercase
   */
  function colorCreateFilter(val) {
    return (val.substr(0, 1).toUpperCase() + val.substr(1).toLowerCase()).trim();
  }
  
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
          },
          show: function(e) {
            console.log(e.detail);
          }
        },
        mounted() {
          setTimeout(() => {
            /** this is needed, because it's custom-element */
            this.$refs.el.svelecte.$$set({
              createFilter: colorCreateFilter
            })
          }, 500);
        },
        template: `<div>
          <h6>Vue 2 example</h6>
          <div>
            <el-svelecte :options="opts"  @change="onChange" @createoption="show"
              :value="selected"
              :placeholder="placeholder"
              renderer="color-blocks"
              multiple creatable
              label-as-value
              ref="el"
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