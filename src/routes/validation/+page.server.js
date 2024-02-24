import { superValidate, message } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { schema } from './schema';
import { dataset } from '../data';

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
		console.dir(form, { depth: 5 });

		if (!form.valid) return fail(400, { form });

		return message(form, `Form posted successfully! You have submitted ${form.data.tags.length} colors.`);
	}
};
