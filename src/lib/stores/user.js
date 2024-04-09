import { browser } from "$app/environment";
import { getJSON, scrypt } from "$lib/utils/helpers";
import { derived, get, writable } from "svelte/store";

const _user = writable(null);

if (browser) {

    (function() {
        try {
            let p = localStorage.getItem("gwx.user");
            const value = scrypt.decrypt(p);
            console.log("the json value", value);
            _user.set(getJSON(value));
        } catch (error) {}
    })();

    _user.subscribe(async value => {
        let val = null;
        if (typeof value == 'object') {
            val = scrypt.encrypt(JSON.stringify(value));
        }
        localStorage.setItem("gwx.user", val);
    });
}

export const user = derived(_user, e => e );

export const getUserJSON = get(_user);

export function getUser() {
    try {
        return scrypt.decrypt(localStorage.getItem("gwx.user"))
    } catch (error) {
        return null;
    }
}

export function updateUser(data = {}) {
    if (!get(_user)) {
        return 
    }

    _user.update((val) => {
        data = Object.assign(val, data);
        return data;
    });

    return data;
}

export function setUser(data = {}, merge = false) {

    if (!merge) {
        _user.set(data);
    } else {
        let value = get(_user) || {};
        data = Object.assign(value, data);
        _user.set(data);
    }
}

export function removeUser() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("gwx")) {
            localStorage.removeItem(key);
        }
    })
    _user.set(null);
}