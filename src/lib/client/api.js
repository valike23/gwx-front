import { PUBLIC_API_BASE_URL } from "$env/static/public"
import { user } from "$lib/stores/user";
import { get } from "svelte/store";

import axios from 'axios';
import { goto } from "$app/navigation";

export const axiosFetch = axios.create({
    baseURL: PUBLIC_API_BASE_URL,
    headers: {
        "Accept": "application/json",
        "content-type": "application/json"
    },
    transformRequest: [function (data, headers) {

        let account = get(user);
        if (account && account.token) {
            headers.setAuthorization(`Bearer ${account.token}`);
        }

        return data;
    }],
    timeout: 30000
});


/**
 * 
 * @param {object} arg
 * @param {string} arg.path
 * @param {string} arg.method
 * @param {object} arg.query
 * @param {object} arg.body
 * @param {object} arg.headers
 * @param {function(input: RequestInfo | URL, init?: RequestInit)} withFetch
 * @returns {Promise<Response>} A promise that resolves to a fetch response.
 */
export function clientFetch({path, query, method = "GET", body, headers }, withFetch = fetch) {
    
    const opts = { method, credentials: 'include' };

    // compose headers
    opts.headers = Object.assign({
        "Accept": "application/json",
        "Content-Type":  "application/json"
    }, headers || {});

    // add body if any
    if (["POST", "PUT", "PATCH"].includes(method) && body) {
        if (body instanceof FormData) {
            opts.body = body;
            delete opts.headers["Accept"];
            delete opts.headers["Content-Type"];
            // opts.headers["Content-Type"] = "application/x-www-form-urlencoded"
        } else {
            opts.body = (typeof body == 'string') ? body : JSON.stringify(body);
        }
    }

    // add the token to the request
    let account = get(user);
    if (account && account.token) {
        opts.headers["authorization"] = `Bearer ${account.token}`;
    }
    
    // compose url
    if (path.startsWith("/")) {
        path = path.substring(1);
    }

    let suff = Object.entries(query || {}).length ? `?${new URLSearchParams(query).toString()}` : "";

    let fullUrl = `${PUBLIC_API_BASE_URL}${path}${suff}`;

    withFetch ||= fetch;

    return fetchHook(withFetch(fullUrl, opts));
}

/**
 * 
 * @param {Promise<Response>} promisedResponse 
 * @returns {Promise<Response>}
 */
async function fetchHook(promisedResponse) {
    return new Promise((resolve, reject) => {
        promisedResponse.then((res) => {
            if (res.status == 401) {
                goto("/auth/signout", {replaceState: true});
                reject(res);
            } else {
                resolve(res);
            }
        })
    })
}