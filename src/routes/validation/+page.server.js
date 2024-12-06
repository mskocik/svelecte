import { superValidate, message } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { schema } from './schema';
import { dataset } from '../../routes/data';

export const prerender = false;

///// Load function /////

/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
	const form = await superValidate(zod(schema));
	return { form, options: dataset.colors() };
};

///// Form actions /////

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) return fail(400, { form, 'tags[]': 'Submit at least 2 colors' });

    const msg = [
      `<h3 class="status">Form posted successfully!</h3>`,
      form.data.favourite
        ? `Your favourite color is <span style="color: ${form.data.favourite}">${form.data.favourite}</span>`
        : 'You submitted no favourite color 🤔',
      `You have also submitted colors: ${form.data.tags.join(', ')}.`
    ];
		return message(form, msg.join('<br>'));
	}
};
