<script>
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import {
    enableNotification,
        registerPushNotification,
    } from "$lib/client/helpers";
    import { listenForMessages } from "$lib/client/listener";
    import { getPreferences, setPreference } from "$lib/stores/app";
    import { failure } from "$lib/utils/toast";
    import { Button, Modal } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilBell } from "svelte-unicons";

    let showModal = false;
    let isLoading = false;

    const user = $page.data.session.user;

    onMount(() => {

        if (user) {
            const prefs = getPreferences();

            if (prefs.push) {
                checkPushNotification();
            } else {
                if ('Notification' in window && Notification.permission == "default") {
                    showModal = true;
                }
            }
        }

        listenForMessages();
    })

    function checkPushNotification() {
        registerPushNotification()
            .then(sub => {
                setPreference({ push: !!sub });
                if (sub) {
                    clientFetch({
                        path: "/notifications/token/register",
                        method: "POST",
                        body: {
                            platform: "web",
                            token: sub,
                        },
                    })
                    .catch(console.log);
                }
            })
            .catch(console.log);
    }

    async function enable() {
        if (isLoading) return;
        isLoading = true;

        // const sub = await registerPushNotification();
        const sub = await enableNotification();

        if (!sub) throw "Push notifications not enabled";

        clientFetch({
            path: "/notifications/token/register",
            method: "POST",
            body: {
                platform: "web",
                token: sub,
            },
        })
        .then(res => {
            if (res.ok) {
                setPreference({push: true});
            }
        })
        .catch(failure(e))
        .finally(() => {
            isLoading = false;
            showModal = false;
        });
    }
</script>

<slot />

<Modal title="Enable Push Notifications" bind:open={showModal} autoclose>
    <div
        class="mx-auto my-5 w-16 h-16 rounded-xl bg-slate-50 grid place-content-center border border-slate-200 relative"
    >
        <UilBell size="30" strokeWidth="1" />
        <div class="absolute w-3 h-3 bg-red-400 rounded-full top-0 right-0" />
    </div>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        Enable push notifications for GWX to stay up-to-date on your shipments,
        packages, delivery, and everything happening around your account.
    </p>
    <svelte:fragment slot="footer">
        <Button 
            disabled={isLoading}
            on:click={() => enable()}>
            Enable
        </Button>
    </svelte:fragment>
</Modal>
