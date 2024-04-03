import { clientFetch } from '$lib/client/api';
import { networkError } from '$lib/utils/helpers';
import { error } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ url, fetch }) {

    const id = url.searchParams.get("id"); 

    const res = await clientFetch({
        path: "/packages/" + id + "/track",
    }, fetch);

    const json = await res.json();

    // if (!res.ok) {
    //     throw error(res.status, networkError(json));
    // }
    
    return {
        data: res.ok ? json.data : null
    }
}