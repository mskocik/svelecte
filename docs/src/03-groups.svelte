<script>
  import Svelecte from '../../src/Svelecte.svelte';

  const options = [
    {
      label: 'A',
      options: [{
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
      label: 'B',
      options: [{
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
      label: 'C',
      options: [{
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

<Svelecte {options}></Svelecte>