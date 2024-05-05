import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';
import { dataset } from '../src/routes/data';

// FUTURE: mock fetch

describe('fetch: onMount', () => {
  it('resolve \'init\' fetchMode automatically', async () => {
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      fetchDebounceTime: 0
    });

    let fetchTriggered = false;
    component.$on('fetch', () => {
      fetchTriggered = true;
    });

    await sleep(300);

    expect(fetchTriggered).toBeTruthy();
  });

  it('no initial request on query mode', async () => {
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0
    });

    let fetchTriggered = false;
    component.$on('fetch', () => {
      fetchTriggered = true;
    });

    await sleep(500);

    expect(fetchTriggered).toBeFalsy();
  });
});

describe('fetch:init', () => {
  it('properly set initial value while in liFtst (v3 compatible) step I', async () => {
    const { component, rerender } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      fetchDebounceTime: 0,
      value: 'blue'
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();

    rerender({ fetch: 'http://localhost:5173/api/colors-countries' });

    await sleep(1000);

    expect(screen.queryByText('Blue')).toBeInTheDocument();

  });

  it('properly set initial value while in list (v3 compatible) step II', async () => {
    const { component, rerender } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      fetchDebounceTime: 0,
      fetchMode: 'init',
      value: 'blue'
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();

    rerender({ fetch: 'http://localhost:5173/api/countries-colors?sleep=400' });
    await sleep(1000);

    expect(screen.queryByText('Blue')).toBeInTheDocument();

    rerender({ fetch: 'http://localhost:5173/api/countries?sleep=400' });
    await sleep(1000);

    expect(screen.queryByText('Blue')).not.toBeInTheDocument();
  });

  it('properly set initial value for multiple', async () => {
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors',
      fetchDebounceTime: 0,
      fetchMode: 'init',
      value: ['blue', 'red'],
      multiple: true
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();
    expect(screen.queryByText('Red')).toBeInTheDocument();
  });
});

describe('fetch:query', () => {
  it('fetch default value object', async () => {
    render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0,
      value: 'blue'
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();
  });

  it('properly set initial value for multiple', async () => {
    render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0,
      fetchMode: 'init',
      value: ['blue', 'red'],
      multiple: true
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();
    expect(screen.queryByText('Red')).toBeInTheDocument();
  });

  it('use refetchWith to fetch newly changed default value', async () => {
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0,
      value: 'blue',
      // fetchMode: 'init'  // NOTE: resolved automatically from `fetch`
    });

    await sleep(300);

    expect(screen.queryByText('Blue')).toBeInTheDocument();

    component.refetchWith('red');

    await sleep(500);

    expect(screen.queryByText('Red')).toBeInTheDocument();
  });

  it('[valueAsObject] default value passed, value NOT set ', async () => {

    const colors = dataset.colors();
    const selection = colors.shift();  // aqua

    let event_triggered = false;
    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0,
      valueAsObject: true,
      value: selection,
      onInvalidValue: () => event_triggered = true
    });

    await sleep(100);

    expect(event_triggered).toBeTruthy();
  });

  it('[valueAsObject]  default value passed, value IS set [strictMode=false]', async () => {
    const colors = dataset.colors();
    const selection = colors.shift();  // aqua

    const { component } = render(Svelecte, {
      fetch: 'http://localhost:5173/api/colors?query=[query]',
      fetchDebounceTime: 0,
      valueAsObject: true,
      strictMode: false,
      value: selection,
      onInvalidValue: () => event_triggered = true
    });
    let event_triggered = false;

    await sleep(10);

    expect(screen.queryByText('Aqua')).toBeInTheDocument();
    expect(event_triggered).toBeFalsy();
  });
});
