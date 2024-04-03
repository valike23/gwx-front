import { redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export async function load({ }) {

    throw redirect(307, "/customer")
}