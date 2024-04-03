/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import { getJSON } from '$lib/client/sw';

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

sw.addEventListener('install', (event) => {
	console.log("Installed SW");
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
	console.log("Activated SW");
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
		sw.clients.claim();
	}

	event.waitUntil(deleteOldCaches());
});

sw.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

	// We only want to send /offline.html when the user is navigating pages,
	// not when they're requesting something else like CSS files or API requests.
	if (event.request.mode !== "navigate") return;

	if (!(new URL(event.request.url).protocol.startsWith("http"))) return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			return cache.match(url.pathname);
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch {
			return cache.match(event.request);
		}
	}

	event.respondWith(respond());
});

sw.addEventListener('push', (event) => {
	const data = getJSON(event.data.text());

	if (typeof data == 'string') {
		event.waitUntil(
			sw.registration.showNotification("New notification", {
				body: data,
				icon: "/icons/icon-512.png",
				badge: "/images/logo.png",
				vibrate: [100,100,100]
			})
		)
		return;
	}

	let options = {
		body: data.body || "",
		icon: data.icon || "/icons/icon-512.png",
		image: data.image,
		badge: data.badge || "/images/logo.png", 
		timestamp: data.timestamp,
		actions: data.actions,
		data: data.data,
		tag: data.tag,
		sound: data.sound,
		vibrate: data.vibrate || [100, 100, 100]
	}	

	const processData = () => {
		if (options.data) {
			const payload = Object.assign({title: data.title, body: options.body}, data.data);

			if ('BroadcastChannel' in self) {
				const bc = new BroadcastChannel("gwx_channel");
				bc.postMessage(payload);
			} else {
				// send via service worker post message
				sw.registration.active.postMessage(payload);
			}
		}

		return sw.registration.showNotification(data.title, options)
	}

	event.waitUntil(processData());
})