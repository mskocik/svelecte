import { http, HttpResponse } from 'msw';
import { dataset } from '../../src/routes/data';

export const handlers = [
  http.get('http://test.svelecte.fetch/api/:id', async ({ request, params }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    const initial = url.searchParams.get('init');
    // dev param
    const throttle = url.searchParams.get('sleep') || null;

    try {
      const { id } = params;
      // allow multipe sources
      // @ts-ignore
      let data = id.split('-')
        .map(data => dataset[data]())
        .reduce((/** @type {array} */ res, list) => {
          // country groups
          if (Array.isArray(list[0].options)) list = list.reduce((r, g) => r.concat(...g.options), []);
          return res.concat(...list);
        }, []);

      if (query === 'init' && initial) {
        const vals = initial.split(',');
        data = data.filter(c => vals.includes(c.value));
      } else if (query) {
        data = data.filter(c => c.text.toLowerCase().includes(query.toLowerCase()));
      }

      return HttpResponse.json({ data });
    } catch (e) {
      return HttpResponse.json({ data: [], error: e.message });
    }
  })
]
