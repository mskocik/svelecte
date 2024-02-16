import { json } from "@sveltejs/kit";
import { dataset } from "../../data.js";

const colors = dataset.colors();

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  });
}

export async function GET({ url }) {
  const parent = url.searchParams.get('parent');
  const query = url.searchParams.get('query');

  try {

    let data = dataset[parent]();
    if (query) {
      data = colors.filter(c => c.text.toLowerCase().includes(query.toLowerCase()));
    }
    
    return json({ data });
  } catch (e) {
    return json({ data: [], error: e.message });
  }
}
