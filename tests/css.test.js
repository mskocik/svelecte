import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event'
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';

describe('.is-single', () => {
  it('single select', () => {
    const { container } = render(Svelecte);

    expect(container.querySelector('.is-single')).toBeInTheDocument();
  });

  it('multi select', () => {
    const { container } = render(Svelecte, {
      multiple: true
    });

    expect(container.querySelector('.is-single')).toBeNull();
  });
});


describe('.is-valid', () => {
  it('required', async () => {
    const { container, rerender } = render(Svelecte, {
      required: true
    });

    expect(container.querySelector('.is-required')).toBeInTheDocument();
    expect(container.querySelector('.is-valid')).toBeNull();

    await rerender({ multiple: true });
    expect(container.querySelector('.is-required')).toBeInTheDocument();
    expect(container.querySelector('.is-valid')).toBeNull();
  });


  it('optional', async () => {
    const { container, rerender } = render(Svelecte);

    expect(container.querySelector('.is-required')).toBeNull();
    expect(container.querySelector('.is-valid')).toBeInTheDocument();

    await rerender({ multiple: true });
    expect(container.querySelector('.is-required')).toBeNull();
    expect(container.querySelector('.is-valid')).toBeInTheDocument();
  });


  it('toggle required', async () => {
    const rr = render(Svelecte, {
      name: 'component',
      required: true,
    });

    expect(rr.container.querySelector('.is-required')).toBeInTheDocument();
    expect(rr.container.querySelector('.is-valid')).toBeNull();
    expect(rr.container.querySelector('.is-invalid')).toBeInTheDocument();

    await rr.rerender({ required: false });
    expect(rr.container.querySelector('.is-required')).toBeNull();
    expect(rr.container.querySelector('.is-valid')).toBeInTheDocument();
  });
});

describe('.is-focused', () => {
  it('focused after click', async () => {

    const user = userEvent.setup();

    const { container } = render(Svelecte, {
      name: 'test',
      inputId: 'input'
    });

    expect(container.querySelector('.is-focused')).toBeNull();

    await user.click(container.querySelector('input'));

    expect(container.querySelector('.is-focused')).toBeInTheDocument();
  });
});

describe('.is-open', () => {
  it('dropdown toggled by arrow', async () => {

    const user = userEvent.setup();

    const { container } = render(Svelecte, {
      name: 'test',
      inputId: 'input'
    });

    expect(container.querySelector('.is-focused')).toBeNull();
    expect(container.querySelector('.is-open')).toBeNull();

    await user.click(container.querySelector('button[data-action="toggle"]'));

    expect(container.querySelector('.is-focused')).toBeNull();
    expect(container.querySelector('.is-open')).toBeInTheDocument();
  });
});

describe('.is-disabled', () => {
  it('disabled', async () => {
    const { container, rerender } = render(Svelecte, {
      disabled: false
    });

    /** @type {HTMLInputElement} */
    const input = container.querySelector('input');

    input.focus();
    expect(input).toHaveFocus();
    expect(container.querySelector('.is-disabled')).toBeNull();
    input.blur();

    await rerender({ disabled: true });

    expect(input).not.toHaveFocus();
    expect(container.querySelector('.is-disabled')).toBeInTheDocument();
  });

});

