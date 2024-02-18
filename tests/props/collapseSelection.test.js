import { render, screen } from '@testing-library/svelte';
import Svelecte from '$lib/Svelecte.svelte';
import { sleep } from '../helpers';
import userEvent from '@testing-library/user-event';

describe('collapseSelection:always', () => {
  it('focus / blur toggle', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: ['Two'],
      multiple: true,
      collapseSelection: 'always'
    });

    const input = rr.container.querySelector('input');

    expect(screen.queryByText('1 selected')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(input);

    expect(screen.queryByText('1 selected')).toBeInTheDocument();
  });

  it('removing selected item with backspace', async () => {
    const { container } = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: ['Two'],
      multiple: true,
      collapseSelection: 'always'
    });

    const input = container.querySelector('input');
    const user = userEvent.setup();
    await user.click(input);

    await user.keyboard('{Backspace}');

    expect(screen.queryByText('1 selected')).toBeInTheDocument();
  })

  it('deselect option by clicking in dropdown', async () => {
    const { container } = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: ['Two'],
      multiple: true,
      collapseSelection: 'always',
      // if `list-header` slot is not defined, this is the only way how to show selected items and possibly deselect them
      keepSelectionInList: true
    });

    const input = container.querySelector('input');
    const user = userEvent.setup();
    await user.click(input);

    expect(screen.queryByText('Two')).toBeInTheDocument();

    await user.click(screen.queryByText('Two'));

    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
  })
});


describe('collapseSelection:blur', () => {
  it('focus / blur toggle', async () => {
    const rr = render(Svelecte, {
      options: ['One', 'Two', 'Three', 'Four', 'Five'],
      value: ['Two'],
      multiple: true,
      collapseSelection: 'blur'
    });

    const input = rr.container.querySelector('input');

    expect(screen.queryByText('1 selected')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(input);

    await sleep(200); // there is timeout in the code itself set to 100ms, need to take that into account

    expect(screen.queryByText('1 selected')).not.toBeInTheDocument();
    expect(screen.queryByText('Two')).toBeInTheDocument();
  });
});
