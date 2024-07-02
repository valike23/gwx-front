import { clientFetch } from '$lib/client/api';
import { networkError } from '$lib/utils/helpers';
import { error } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
console.log('the id is', params.id);
    const res = await clientFetch({
        path: "/hubs/" + params.id
    }, fetch);

    const json = await res.json();
    console.log("the hub to be returned2", json);

    if (!res.ok) {
        throw error(res.status, networkError(json));
    }
    return {
        hub: json.data
    }
}