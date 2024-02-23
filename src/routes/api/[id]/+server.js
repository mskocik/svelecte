import { json } from "@sveltejs/kit";
import { dataset } from "../../data.js";

const colors = dataset.colors();

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  });
}

export async function GET({ url, params }) {
  const query = url.searchParams.get('query');
  const initial = url.searchParams.get('init');
  // dev param
  const throttle = url.searchParams.get('sleep') || null;

  try {
    if (throttle) {
      await sleep(parseInt(throttle));
    }
    // asdasdasasd
    // allow multipe sources
    let data = params.id.split('-')
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

    return json({ data });
  } catch (e) {
    return json({ data: [], error: e.message });
  }
}
