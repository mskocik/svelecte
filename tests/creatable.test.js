import Svelecte from "$lib/Svelecte.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { sleep } from "./_helpers";

describe('creatable', () => {
  it('define and select', async () => {
    const { container } = render(Svelecte, {
      name: 'select',
      creatable: true
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');

    expect(container.querySelector('select option').getAttribute('value')).toBe('item');

  });

  it('createHandler error', async () => {
    let errorCatched = false;
    const { container, component } = render(Svelecte, {
      name: 'select',
      creatable: true,
      keepCreated: true,
      createHandler: function(props) {
        throw new Error('error');
      },
      onCreateFail: () => {
        errorCatched = true;
      }
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');

    await sleep(100);

    expect(errorCatched).toBeTruthy();
  });
});
