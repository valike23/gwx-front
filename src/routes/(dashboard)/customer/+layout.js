import { redirect } from '@sveltejs/kit';
import { roleRoutes } from '$lib/data/roles';

export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export async function load({ parent, fetch }) {

    let data = await parent();

    if (!["user", "customer"].includes(data.session?.user.role)) {
        throw redirect(307, roleRoutes[data.session?.user.role])
    }

    return data;
}