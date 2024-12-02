import { act, render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';
import { dataset } from '../src/routes/data';
import { describe } from 'vitest';
import { flushSync } from 'svelte';

describe('Core', () => {
  it('Mount', () => {
    const { container } = render(Svelecte);

    expect(container.querySelector('.svelecte')).toBeInTheDocument();
  });


  it('Dropdown initial rendering (lazy)', async () => {
    const { container }= render(Svelecte, {
      options: ['One', 'Two', 'Three']
    });

    // dropdown content not rendered
    const dropdownEl = container.querySelector('.sv_dropdown');
    expect(dropdownEl).toBeInTheDocument();
    expect(dropdownEl.childElementCount).toBe(0);

    // renderer on first interaction
    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    expect(dropdownEl.childElementCount).toBeGreaterThan(0);
  });


  it('Dropdown initial rendering (eager)', () => {
    const { container } = render(Svelecte, {
      options: ['One', 'Two', 'Three'],
      lazyDropdown: false
    });
    const dropdownOptions = container.querySelectorAll('.sv_dropdown .in-dropdown');
    expect(dropdownOptions.length).toBeGreaterThan(0);
  });


  it('Render options groups', () => {
    let props = $state({
      options: dataset.countryGroups(),
      value: 'cz',
      lazyDropdown: false
    });
    const { container } = render(Svelecte, { props });

    console.log(container.firstElementChild.innerHTML);

    expect(screen.queryAllByText('Czechia').length).toBeGreaterThan(1);
  });


  it('Emit changeEvent', async () => {
      let value = $state(null);
      let options = $state([
        {id: 1, text: 'One'},
        {id: 2, text: 'Two'},
        {id: 3, text: 'Three'},
      ]);

      let emitted = false;

      const { container } = render(Svelecte, {
        value, options, onChange: () => { emitted = true; }
      } );

      const inputEl = screen.queryByPlaceholderText('Select');
      const user = userEvent.setup();
      await user.click(container.querySelector('input'));
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(emitted).toBeTruthy();
  });
});

describe('Interactions', () => {
  it('select & deselect [single]', async () => {
    let props = $state({
      value: null,
      options: dataset.colors(),
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toBe('blue');

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toBe('green');

    await user.keyboard('{Backspace}');

    expect(props.value).toBeNull();
  });


  it('select & deselect w/ initial [single]', async () => {
    let props = $state({
      value: 'red',
      options: dataset.colors(),
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toBe('teal'); // we start from 'red'

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toBe('aqua'); // overscroll to the first

    await user.keyboard('{Backspace}');

    expect(props.value).toBeNull();
  });


  it('select & deselect [multiple]', async () => {
    let value = [];
    let props = $state({
      value: [],
      options: dataset.colors(),
      multiple: true,
      keepSelectionInList: true,
      onChange: s => value = s
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    let expected = ['blue'];
    expect(value).toEqual(expected);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expected.push('green');
    expect(value).toEqual(expected);

    await user.keyboard('{Backspace}');
    expected.splice(1);

    expect(value).toEqual(expected);
  });


  it('select & deselect /w initial [multiple]', async () => {
    let props = $state({
      value: ['red'],
      options: dataset.colors(),
      multiple: true,
      keepSelectionInList: true,
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    let expected = ['red', 'blue' ];
    expect(props.value).toEqual(expected);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expected.push('green');
    expect(props.value).toEqual(expected);

    await user.keyboard('{Backspace}');
    expected.pop();

    expect(props.value).toEqual(expected);

    await user.keyboard('{Control>}{Backspace}{/Control}');
    // await user.keyboard('');
    // await user.keyboard('');

    expect(props.value).toEqual([]);
  });

})


describe('Interactions [valueAsObject]', () => {
  it('select & deselect [single]', async () => {
    let props = $state({
      value: null,
      options: dataset.colors(),
      valueAsObject: true
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toEqual(dataset.color(2));

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toEqual(dataset.color(4));

    await user.keyboard('{Backspace}');

    expect(props.value).toBeNull();
  });

  it('select & deselect /w initial [single]', async () => {
    let props = $state({
      value: dataset.color(2),
      options: dataset.colors(),
      valueAsObject: true
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toEqual(dataset.color(4));

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(props.value).toEqual(dataset.color(6));

    await user.keyboard('{Backspace}');

    expect(props.value).toBeNull();
  });


  it('select & deselect [multiple]', async () => {
    let props = $state({
      value: [],
      multiple: true,
      valueAsObject: true,
      keepSelectionInList: true,
      options: dataset.colors(),
      // onChange: selection => {
      //   value = selection
      // }
    });

    const { container, component } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    let expected = [dataset.color(2)];

    expect(props.value).toEqual(expected);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expected.push(dataset.color(4));
    expect(props.value).toEqual(expected);

    await user.keyboard('{Backspace}');
    expected.splice(1);

    expect(props.value).toEqual(expected);
  });


  it('select & deselect /w initial [multiple]', async () => {
    let props = $state({
      value: [dataset.color(2)],
      multiple: true,
      valueAsObject: true,
      keepSelectionInList: true,
      options: dataset.colors(),
      // onChange: selection => {
      //   value = selection
      // }
    });

    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    let expected = [dataset.color(2), dataset.color(4)];
    expect(props.value).toEqual(expected);

    await user.keyboard('{Backspace}');
    expected.pop();

    expect(props.value).toEqual(expected);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expected.push(dataset.color(6));

    expect(props.value).toEqual(expected);
  });

})
