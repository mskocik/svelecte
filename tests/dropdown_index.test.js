import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';

const options = [...Array(101).keys()]
  .map(n => `Item ${n}`)
  .slice(1);

describe('dropdown_index: single select', () => {
  it('opend dropdown with first item focused', async () => {
    const { container } = render(Svelecte, {
      options,
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));
    await sleep(200);

    const dropdownItem = screen
      .queryByText('Item 1')  // content
      .parentElement;       // wrap
    expect(dropdownItem.classList.contains('sv-dd-item-active')).toBeTruthy();
  });

  it('open dropdown wihout item focused', async () => {
    const { container } = render(Svelecte, {
      options,
      highlightFirstItem: false
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));

    const dropdownItem = screen
      .queryByText('Item 1')  // content
      .parentElement;       // wrap
    expect(dropdownItem.classList.contains('sv-dd-item-active')).toBeFalsy();
  });

  it('open dropdown with selected item focused', async () => {
    const selected = 'Item 77';
    render(Svelecte, {
      options,
      value: selected
    });

    const user = userEvent.setup();
    await user.click(screen.queryByText(selected));

    const dropdownItem = screen
      .queryAllByText(selected).pop()   // dropdown content
      .parentElement;                   // wrap

    expect(dropdownItem.classList.contains('sv-dd-item-active')).toBeTruthy();
  });

  it('move by ⬆️ and focus last dropdown item (scroll)', async () => {
    const { container } = render(Svelecte, {
      options,
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));

    await user.keyboard('{ArrowUp}');

    await sleep(200);

    const focusedOption = screen.queryByText('Item 100').parentElement;
    expect(focusedOption.classList.contains('sv-dd-item-active')).toBeTruthy();
  });


  it('move by End and focus last dropdown item (scroll)', async () => {
    const { container } = render(Svelecte, {
      options,
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));

    await user.keyboard('{End}');

    await sleep(200);

    const focusedOption = screen.queryByText('Item 100').parentElement;
    expect(focusedOption.classList.contains('sv-dd-item-active')).toBeTruthy();
  });


  // this cannot be tested
  it.skip('move by PageDown and scroll by 1 container height', async () => {
    const { container } = render(Svelecte, {
      options,
    });

    const user = userEvent.setup();
    await user.click(container.querySelector('input'));

    const focusedOption = screen.queryByText('Item 1').parentElement;
    const optionHeight = focusedOption.getBoundingClientRect().height;

    await user.keyboard('{PageDown}');

    await sleep(200);
    const scrollContainer_scroll = focusedOption
      .parentElement    // container
      .parentElement   // scrollContainer
      .scrollTop;

    expect(scrollContainer_scroll).toBeGreaterThan(optionHeight);
  });

});
