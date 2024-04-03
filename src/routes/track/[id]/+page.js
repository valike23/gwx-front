import { clientFetch } from '$lib/client/api';
import { networkError } from '$lib/utils/helpers';
import { error, redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {

    throw redirect(307, "/track?id=" + params.id);

    const res = await clientFetch({
        path: "/packages/" + params.id + "/track",
    }, fetch);

    const json = await res.json();

    if (!res.ok) {
        throw error(res.status, networkError(json));
    }
    
    return {
        data: json.data
    }
}