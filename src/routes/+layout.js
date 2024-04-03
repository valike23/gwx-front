import { clientFetch } from "$lib/client/api";
import { getPreferences } from "$lib/stores/app";
import { getUser, setUser, updateUser } from "$lib/stores/user";

export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export async function load() {

    let user = getUser();
    let session = {
        user: user,
        preferences: getPreferences()
    };

    return { session }
}