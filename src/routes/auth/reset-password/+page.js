import { clientFetch } from '$lib/client/api';
import { removeUser, setUser } from '$lib/stores/user';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {

    let token = url.searchParams.get("token");

    const res = await clientFetch({
        path: "auth/forgot-password/validate-token?token=" + token
    }, fetch);

    if (![200, 403].includes(res.status)) {
        throw redirect(307, "/auth/login");
    }

    const json = await res.json();

    return {
        auth: {
            valid: !!json.data.valid,
            message: json.message,
            token: token
        }
    }
}