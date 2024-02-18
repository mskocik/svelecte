import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event'
import Svelecte from '$lib/Svelecte.svelte';

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('.is-single', () => {
  it('single select', () => {
    const rr = render(Svelecte);
    
    expect(rr.container.querySelector('.is-single')).toBeInTheDocument();
  });

  it('multi select', () => {
    const rr = render(Svelecte, {
      multiple: true
    });
    
    expect(rr.container.querySelector('.is-single')).toBeNull();
  });
});


describe('.is-valid', () => {
  it('required', () => {
    const rr = render(Svelecte, {
      required: true
    });
    
    expect(rr.container.querySelector('.is-required')).toBeInTheDocument();
    expect(rr.container.querySelector('.is-valid')).toBeNull();
    
    rr.component.$$set({ multiple: true });
    expect(rr.container.querySelector('.is-required')).toBeInTheDocument();
    expect(rr.container.querySelector('.is-valid')).toBeNull();
  });

  it('optional', () => {
    const rr = render(Svelecte);

    expect(rr.container.querySelector('.is-required')).toBeNull();
    expect(rr.container.querySelector('.is-valid')).toBeInTheDocument();
    
    rr.component.$$set({ multiple: true });
    expect(rr.container.querySelector('.is-required')).toBeNull();
    expect(rr.container.querySelector('.is-valid')).toBeInTheDocument();
  });
});

describe('.is-focused', () => {
  it('focused after click', async () => {

    const user = userEvent.setup();
    
    const rr = render(Svelecte, {
      name: 'test',
      inputId: 'input'
    });
    
    expect(rr.container.querySelector('.is-focused')).toBeNull();

    await user.click(screen.getByPlaceholderText('Select'));
    
    expect(rr.container.querySelector('.is-focused')).toBeInTheDocument();
  });
});

describe('.is-open', () => {
  it('dropdown toggled by arrow', async () => {

    const user = userEvent.setup();
    
    const rr = render(Svelecte, {
      name: 'test',
      inputId: 'input'
    });
    
    expect(rr.container.querySelector('.is-focused')).toBeNull();
    expect(rr.container.querySelector('.is-open')).toBeNull();

    await user.click(rr.container.querySelector('button[data-action="toggle"]'));
    
    expect(rr.container.querySelector('.is-focused')).toBeNull();
    expect(rr.container.querySelector('.is-open')).toBeInTheDocument();
  });
});

describe('.is-disabled', () => {
  it('disabled', async () => {
    const rr = render(Svelecte, {
      disabled: false
    });
    
    /** @type {HTMLInputElement} */
    const input = screen.getByPlaceholderText('Select');

    input.focus();
    expect(input).toHaveFocus();
    expect(rr.container.querySelector('.is-disabled')).toBeNull();
    input.blur();

    rr.component.$$set({ disabled: true });

    await sleep(0); // required to wait for the test

    expect(input).not.toHaveFocus();
    expect(rr.container.querySelector('.is-disabled')).toBeInTheDocument();
  });

});

