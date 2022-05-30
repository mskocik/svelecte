<script>
  import Svelecte from '../../src/Svelecte.svelte';

  const options = [
    {
      groupHeader: 'A',
      items: [{
        value: 'al',
        text: 'Albania'
      },
      {
        value: 'ad',
        text: 'Andorra'
      },
      {
        value: 'am',
        text: 'Armenia'
      },
      {
        value: 'a',
        text: 'Austria'
      },
      {
        value: 'az',
        text: 'Azerbaijan'
      }]
    },
    {
      groupHeader: 'B',
      items: [{
        value: 'by',
        text: 'Belarus'
      },
      {
        value: 'be',
        text: 'Belgium'
      },
      {
        value: 'ba',
        text: 'Bosnia and Herzegovina'
      },
      {
        value: 'bg',
        text: 'Bulgaria'
      }]
    },
    {
      groupHeader: 'C',
      items: [{
        value: 'hr',
        text: 'Croatia'
      },
      {
        value: 'cy',
        text: 'Cyprus'
      },
      {
        value: 'cz',
        text: 'Czechia'
      }]
    }
  ]
</script>

<Svelecte {options} groupLabelField="groupHeader" groupItemsField="items"></Svelecte>