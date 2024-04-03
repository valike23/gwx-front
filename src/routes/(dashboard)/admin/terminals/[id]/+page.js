import { clientFetch } from '$lib/client/api';
import { networkError } from '$lib/utils/helpers';
import { error } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {

    const res = await clientFetch({
        path: "/hubs/" + params.id
    }, fetch);

    const json = await res.json();

    if (!res.ok) {
        throw error(res.status, networkError(json));
    }
    return {
        hub: json.data
    }
}