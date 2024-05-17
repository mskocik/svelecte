import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';

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
    await user.click(screen.queryByPlaceholderText('Select'));
    expect(dropdownEl.childElementCount).toBeGreaterThan(0);
  });

  it('Dropdown initial rendering (eager)', () => {
    const { container } = render(Svelecte, {
      options: ['One', 'Two', 'Three'],
      lazyDropdown: false
    });
    const dropdownEl = container.querySelector('.sv_dropdown');
    expect(dropdownEl.childElementCount).toBeGreaterThan(0);
  });

  it('Avoid mutating option objects', async () => {

    let value = $state();
    let options = $state([
      {id: 1, text: 'One'},
      {id: 2, text: 'Two'},
      {id: 3, text: 'Three'},
    ]);
    const { container } = render(Svelecte, {
      options, onChange: (obj) => { value = obj.id }
    });

    const inputEl = screen.queryByPlaceholderText('Select');
    const user = userEvent.setup();
    await user.click(inputEl);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    options.push({id: 5, text: 'Five'});

    expect(options.some(o => o.$selected)).toBeFalsy();

    await user.click(inputEl);
    await user.keyboard('Fi');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(value).toBe(5);
    expect(options.some(o => o.$selected)).toBeFalsy();
  });
})
