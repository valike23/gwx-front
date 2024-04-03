/// <reference types="@sveltejs/kit" />

interface SessionData {
	// Your session data
	user: Record<string, unknown>;
	token: string;
	expires: string;
	preferences: Record<string, unknown>
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {

    // the session data
    interface Session extends SessionData {}

    // the page data
    interface PageData {
		session: SessionData;
	}
}