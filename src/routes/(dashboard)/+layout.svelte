<script>
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import {
    enableNotification,
        registerPushNotification,
    } from "$lib/client/helpers";
    
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
    import { listenForMessages } from "$lib/client/listener";
    import { getPreferences, setPreference } from "$lib/stores/app";
    import { failure } from "$lib/utils/toast";
    import { Button, Modal } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilBell } from "svelte-unicons";

    let showModal = false;
    let isLoading = false;
// Import the functions you need from the SDKs you need
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAvDhawTShOOwOvsW9vCuH5lTOgec2SKIE",
    authDomain: "gwxpro-cf273.firebaseapp.com",
    projectId: "gwxpro-cf273",
    storageBucket: "gwxpro-cf273.appspot.com",
    messagingSenderId: "1030645756446",
    appId: "1:1030645756446:web:b545609d7a60a76f84340f",
    measurementId: "G-D04V7V1K3D"
  };

  // Initialize Firebase
 
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
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
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
