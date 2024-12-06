import { render, screen } from '@testing-library/svelte';
import Svelecte, { config } from '$lib/Svelecte.svelte';
import { sleep } from './_helpers';
import userEvent from '@testing-library/user-event';
import { dataset } from '../src/routes/data';

/** @type {import('$lib/settings').I18nObject} */
const i18n = config.i18n;

describe('listMessage', () => {
  // empty
  it('empty', async () => {
    render(Svelecte, {
      lazyDropdown: false
    });

    expect(screen.queryByText(i18n.empty)).toBeInTheDocument();
  });


  // all items selected
  it('empty (all selected)', async () => {
    const { container } = render(Svelecte, {
      options: dataset.colors().slice(0, 2),
      multiple: true,
      lazyDropdown: false
    })

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('{Enter}');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);

    expect(container.querySelector('.sv_dropdown .sv-item--content').textContent).toBe(i18n.empty);
  });


  // nomatch
  it('nomatch', async () => {
    const { container } = render(Svelecte, {
      options: dataset.colors(),
      lazyDropdown: false
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('not in the list');

    await sleep(200);

    expect(container.querySelector('.sv-item--content').textContent).toBe(i18n.nomatch);
  });


  // max
  it('max (init)', async () => {
    const opts = dataset.colors().slice(0, 2);
    render(Svelecte, {
      options:opts,
      value: opts.map(({value}) => value).slice(0,1),
      max: opts.length,
      lazyDropdown: false,
      multiple: true
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.click(screen.queryByText('Black'));

    expect(screen.queryByText(i18n.max(opts.length))).toBeInTheDocument();
  });


  it('max (max reached)', async () => {
    render(Svelecte, {
      options: dataset.colors(),
      lazyDropdown: false,
      max: 2,
      multiple: true,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.max(2), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('max + creatabe (max reached)', async () => {
    render(Svelecte, {
      options: dataset.colors(),
      lazyDropdown: false,
      max: 3,
      multiple: true,
      creatable: true,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    await user.keyboard('my new item');
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.max(3), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('max + creatabe (max reached)', async () => {
    render(Svelecte, {
      options: dataset.colors().slice(0,2),
      lazyDropdown: false,
      max: 4,
      multiple: true,
      creatable: true,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    await user.keyboard('my new item');
    await user.keyboard('{Enter}');
    await user.keyboard('my second item');
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.max(4), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  // emptyCreatable
  it('emptyCreatable', async () => {
    const {container } = render(Svelecte, {
      lazyDropdown: false,
      creatable: true
    });

    expect(screen.queryByText(i18n.emptyCreatable)).toBeInTheDocument();
  });


  it('emptyCreatable when all options already selected', async () => {
    const opts = dataset.colors().slice(0, 2);

    let props = {
      options: opts,
      lazyDropdown: false,
      multiple: true,
      creatable: true
    };
    const { container } = render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.emptyCreatable)).toBeInTheDocument();
  });


  // createRowLabel
  it('createRowLabel', async () => {
    let props = {
      lazyDropdown: false,
      multiple: true,
      creatable: true,
    }
    render(Svelecte, { props });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    const word = 'test';
    await user.keyboard(word);

    expect(screen.queryByText(i18n.createRowLabel(word))).toBeInTheDocument();
  });
});

describe('listMessage [fetch]', () => {
  it('empty (fetch)', async () => {
    render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/not-found',
      fetchDebounceTime: 0,
      lazyDropdown: false
    });

    await sleep(200);

    expect(screen.queryByText(i18n.empty)).toBeInTheDocument();
  });


  it('max + fetch', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      multiple: true,
      max: 1,
      lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('re');
    await sleep(300);
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.max(1), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  // fetchInit
  it('fetchInit', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors',
      fetchDebounceTime: 0,
      lazyDropdown: false,
    });

    expect(screen.queryByText(i18n.fetchInit)).toBeInTheDocument();
  });


  // fetchBefore
  it('fetchBefore', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await sleep(100);

    expect(screen.queryByText(i18n.fetchBefore, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('fetchBefore: add item', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);

    expect(screen.queryByText(i18n.fetchBefore, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('fetchBefore: add item + remove', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      multiple: true,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');

    expect(screen.queryByText(i18n.fetchBefore, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();

    await user.keyboard('{Backspace}');
    await sleep(500);

    expect(screen.queryByText(i18n.fetchBefore, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('fetchBefore: initial value', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      value: ['red', 'blue'],
      fetchDebounceTime: 0,
      lazyDropdown: false,
      multiple: true
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await sleep(100);

    screen.debug(container.querySelector('.sv_dropdown'));
    expect(screen.queryByText(i18n.fetchBefore, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  // fetchQuery
  it('fetchQuery', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      minQuery: 3,
      multiple: true,
      lazyDropdown: false,
    });

    expect(screen.queryByText(i18n.fetchQuery(3, 0))).toBeInTheDocument();
  });


  it('fetchQuery: insufficient input', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      minQuery: 3,
      multiple: true,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('re');
    await sleep(100);

    expect(screen.queryByText(i18n.fetchQuery(3, 0), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();

    await user.keyboard('d');
    await sleep(100);

    expect(screen.queryByText('Red')).toBeInTheDocument();

    // await user.keyboard('{Backspace}');
    // await sleep(500);

    // expect(screen.queryByText(i18n.fetchQuery(3, 0))).toBeInTheDocument();
  });


  it('fetchQuery: multiple item add + remove item', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      minQuery: 2,
      multiple: true,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);

    expect(screen.queryByText(i18n.fetchQuery(2, 0), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();

    await user.keyboard('{Backspace}');
    await sleep(100);

    expect(screen.queryByText(i18n.fetchQuery(2, 0), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  it('fetchQuery: add + reach max', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      minQuery: 2,
      max: 2,
      multiple: true,
      // lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));
    await sleep(100);

    expect(screen.queryByText(i18n.fetchQuery(2, 0), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();

    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);
    await user.keyboard('re');
    await sleep(100);
    await user.keyboard('{Enter}');
    await sleep(100);

    expect(screen.queryByText(i18n.max(2), {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });


  // fetchEmpty
  it('fetchEmpty', async () => {
    const { container } = render(Svelecte, {
      fetch: 'http://test.svelecte.fetch/api/colors?query=[query]',
      fetchDebounceTime: 0,
      lazyDropdown: false,
    });

    const user = userEvent.setup();
    await user.click(screen.queryByPlaceholderText('Select'));

    await user.keyboard('unknown');

    await sleep(300);


    expect(screen.queryByText(i18n.fetchEmpty, {
      selector: '.is-dropdown-row .sv-item--content'  // specify selector to avoid aria element causing error
    })).toBeInTheDocument();
  });
});
