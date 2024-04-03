/**
* 
* @param {string} data 
* @returns {json | null }
*/
export function getJSON(data) {
    try {
        var o = JSON.parse(data);
        if (o && typeof o === 'object') {
            return o;
        }
    } catch (error) {
        return data;
    }
 
    return data;
 }

 /*
  * 
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.body 
 * @param {string} options.icon
 * @param {string} options.badge
 */
export async function sendPushNotification(options) {
    if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
            await reg.showNotification(options.title, {
                body: options.body,
                icon: options.icon || "/icons/icon-192x192.png",
                badge: options.badge || "/icons/badge.png"
            })
        }
    }
}