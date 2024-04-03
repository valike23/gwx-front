import { redirect } from '@sveltejs/kit';
import { clientFetch } from "$lib/client/api";
import { updateUser } from "$lib/stores/user";

export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export async function load({ parent, fetch }) {

    let data = await parent();

    if (!data.session?.user) {
        throw redirect(307, "/auth/login")
    }

    const res = await clientFetch({ path: "/auth/session" }, fetch);
    const json = await res.json();

    if (res.ok) {
        data.session.user = updateUser(json.data, true);
    }

    return data;
}