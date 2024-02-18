import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';

describe('Core', () => {
  it('Empty setup', () => {
    const rr = render(Svelecte);
    
    expect(rr.container.querySelector('.svelecte')).toBeInTheDocument();
  });

  it('Simple single-select', () => {
    
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three']
    });

    const dropdownEl = rr.container.querySelector('.sv_dropdown');
    expect(dropdownEl).toBeInTheDocument();

    expect(dropdownEl.childElementCount).toBe(0);
  })
})
