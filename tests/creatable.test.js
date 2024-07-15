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


  it('keepCreated: true (default)', async () => {
    const { container } = render(Svelecte, {
      name: 'select',
      creatable: true,
      // keepCreated: true, /** true is default global setting */
      creatablePrefix: 'NEW: '
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');
    await user.keyboard('[backspace]');

    expect(screen.queryByText('NEW: item')).toBeInTheDocument();
  });


  it('keepCreated: false', async () => {
    const { container } = render(Svelecte, {
      name: 'select',
      creatable: true,
      keepCreated: false,
      creatablePrefix: 'NEW: '
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');
    await user.keyboard('[backspace]');

    expect(screen.queryByText('NEW: item')).not.toBeInTheDocument();
  });


  it('custom createHandler', async () => {
    const { container } = render(Svelecte, {
      name: 'select',
      creatable: true,
      createHandler: ({inputValue, valueField, labelField, prefix}) => {
        return {
          [valueField]: inputValue,
          [labelField]: inputValue.toUpperCase()
        }
      }
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');
    await user.keyboard('[backspace]');

    expect(screen.queryByText('ITEM')).toBeInTheDocument();
  });


  it('custom createHandler async', async () => {
    const { container } = render(Svelecte, {
      name: 'select',
      creatable: true,
      createHandler: ({inputValue, valueField, labelField, prefix}) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              [valueField]: inputValue,
              [labelField]: inputValue
            })
          }, 100);
        })
      }
    });

    const user = userEvent.setup();
    const input = container.querySelector('input');

    await user.click(input);
    await user.keyboard('item');
    await user.keyboard('[enter]');
    await sleep(200);
    await user.keyboard('[backspace]');


    expect(screen.queryByText('item')).toBeInTheDocument();
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
