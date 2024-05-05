import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';

describe('keepSelectionInList:auto', () => {
  it('open single-select with preselected value and check for selected element before/after typing (config default)', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: 'Two',
    });
    rr.rerender({ value: 'Two'});

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.getAllByText('Two').length).toBe(2);  // selection + list

    await user.keyboard('o');

    expect(screen.getAllByText('Two').length).toBe(1);  // selection only
  });

  it('open single-select with preselected value and check for selected element before/after typing (manually set)', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: 'Two',
      keepSelectionInList: 'auto'
    });
    rr.rerender({ value: 'Two'});

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.getAllByText('Two').length).toBe(2);  // selection + list

    await user.keyboard('o');

    expect(screen.getAllByText('Two').length).toBe(1);  // selection only
  });

  it('open multi-select with preselected (collapsed) value and check for selected element before/after typing (config default)', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      multiple: true,
      value: ['Two'],
      collapseSelection: 'always',
    });

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    await sleep(200);

    expect(screen.queryByText('Two')).not.toBeInTheDocument();

    await user.keyboard('o');

    expect(screen.queryByText('Two')).not.toBeInTheDocument();
  });

  it('open multi-select with preselected (collapsed) value and check for selected element before/after typing (cmanually set)', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      multiple: true,
      value: ['Two'],
      collapseSelection: 'always',
      keepSelectionInList: 'auto'
    });

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.queryByText('Two')).not.toBeInTheDocument();

    await user.keyboard('o');

    expect(screen.queryByText('Two')).not.toBeInTheDocument();
  });
});


describe('keepSelectionInList:true', () => {
  it('open single-select with preselected value and check for selected element before/after typing', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: 'Two'
    });
    rr.rerender({ value: 'Two'});

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.getAllByText('Two').length).toBe(2);  // selection + list

    await user.keyboard('o');

    expect(screen.getAllByText('Two').length).toBe(1);  // selection only
  });

  it('open multi-select with preselected (collapsed) value and check for selected element before/after typing', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      multiple: true,
      value: ['Two'],
      keepSelectionInList: true,
      collapseSelection: 'always'
    });

    const input = rr.container.querySelector('input');

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.queryByText('Two')).toBeInTheDocument();

    await user.keyboard('o');

    expect(screen.queryByText('Two')).not.toBeInTheDocument();
  });
});
