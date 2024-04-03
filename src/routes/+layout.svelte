<script>
    import { fade } from 'svelte/transition';
    import { navigating } from "$app/stores";
    import NProgress from "nprogress";
    import { SvelteToast } from "@zerodevx/svelte-toast";
    import { modal, setPreference } from "$lib/stores/app";

    import "../app.css";
    import "nprogress/nprogress.css"
    import { onMount } from 'svelte';
    

    // configure NProgress
    NProgress.configure({
        minimum: 0.16,
    });

    // Listen to navigation changes
    $: {
        if ($navigating) {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }

    onMount(() => {
        setPreference({push: Notification.permission == "granted"});
    })
</script>

<slot />
<SvelteToast />

{#if $modal}
	<div 
        transition:fade={{ delay: 0, duration: 300 }} 
        class="fixed inset-0 bg-black/20 grid place-content-center z-50 print:hidden"
    >
        <div class="bg-base-100 w-11 h-11 rounded-xl shadow-md grid place-content-center z-50">
            <span class="loading loading-spinner text-primary" />
        </div>
    </div>
{/if}

<!-- ignore svelte(css-unused-selector) -->
<style lang="postcss">
    :global(body) {
        @apply contents min-h-screen w-screen box-border p-0;
    }
    :global(a) {
        @apply focus:outline-none;
    }
</style>
