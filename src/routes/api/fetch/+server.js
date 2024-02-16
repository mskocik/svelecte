import { json } from "@sveltejs/kit";
import { dataset } from "../../data.js";

const colors = dataset.colors();

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  });
}

export async function GET({ url }) {
  const query = url.searchParams.get('query');
  const initial = url.searchParams.get('init');

  let data = colors;
  if (query === 'init' && initial) {
    const vals = initial.split(',');
     data = colors.filter(c => vals.includes(c.value));
  } else if (query) {
    data = colors.filter(c => c.text.toLowerCase().includes(query.toLowerCase()));
  }

  return json({ data });
}
