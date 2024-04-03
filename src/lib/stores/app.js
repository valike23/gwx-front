import { browser } from "$app/environment";
import { getJSON } from "$lib/utils/helpers";
import { derived, get, writable } from "svelte/store";

const _modal = writable(false);
const _prefs = writable({
    theme: "dark"
});

if (browser) {
    (function(){
        try {
            // user preference
            let up = getJSON(localStorage.getItem("gwx.prefs") || "null");
            _prefs.set(typeof up == 'object' ? up : {
                theme: "dark",
                share: window.navigator.canShare()
            });
        } catch (error) {}
    })();

    _prefs.subscribe(value => {
        localStorage.setItem("pokea.prefs", JSON.stringify(value));
    })
}

export const userPrefs = derived(_prefs, e => e);
export const modal = derived(_modal, e => e);

export const drawerOpen = writable(true);

export function toggleDrawer(val) {
    drawerOpen.set(typeof val == 'boolean' ? val : !get(drawerOpen));
}

export function setPreference(val = {}) {
    const data = get(_prefs);
    _prefs.set(Object.assign(data, val));
}

export function getPreferences() {
    return get(_prefs);
}

// Modal functions
export const showModal = () => (_modal.set(true));
export const closeModal = () => (_modal.set(false));
export const toggleModal = () => (_modal.update(e => !e));