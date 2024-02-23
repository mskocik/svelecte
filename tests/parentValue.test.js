import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';

// FUTURE: mock fetch

describe('parentValue', () => {
  it('start as disabled when defined', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      parentValue: null
    });

    expect(container.querySelector('select[disabled]')).toBeInTheDocument();
    expect(container.querySelector('input[disabled]')).toBeInTheDocument();
    expect(container.querySelector('.svelecte.is-disabled')).toBeInTheDocument();
  });

  it('remove parentValue', async () => {
    const { container, component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      parentValue: null
    });

    component.$$set({
      parentValue: undefined
    });

    await sleep(50);

    // screen.debug(container.querySelector('.svelecte'));
    expect(container.querySelector('select[disabled]')).not.toBeInTheDocument();
    expect(container.querySelector('input[disabled]')).not.toBeInTheDocument();
    expect(container.querySelector('.svelecte.is-disabled')).not.toBeInTheDocument();
  });

  it('no fetch when dependent and disabled', async () => {
    const { container, component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?sleep=100',
      parentValue: null
    });
    let fetchTriggered = false;
    component.$on('fetch', () => {
      fetchTriggered = true;
    });

    await sleep(150);

    expect(fetchTriggered).toBeFalsy();

    component.$$set({
      parentValue: undefined
    });

    await sleep(250);

    expect(fetchTriggered).toBeTruthy();
  });


  it('properly replace [parent] placeholder on fetch', async () => {
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/[parent]',
      parentValue: null
    });
    let responseSize = 0;
    component.$on('fetch', e => {
      responseSize = e.detail.length;
    });

    await sleep(150);

    expect(responseSize).toBe(0);

    component.$$set({
      parentValue: 'colors'
    });

    await sleep(250);

    expect(responseSize).toBeGreaterThan(0);
  });
})
