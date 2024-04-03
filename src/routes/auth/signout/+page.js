import { clientFetch } from '$lib/client/api';
import { removeUser, setUser } from '$lib/stores/user';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {

    await clientFetch({path: "auth/logout"}, fetch);

    removeUser();

    setTimeout(() => {}, 100);
    throw redirect(307, "/auth/login");
}