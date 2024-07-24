<script>
    import { listen, onIdle } from 'svelte-idle'
    import Sidebar from "$lib/components/dashboard/admin/Sidebar.admin.svelte";
    import Header from "$lib/components/dashboard/admin/Header.admin.svelte";
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { Drawer } from 'flowbite-svelte';
    import { sineIn } from 'svelte/easing';
    import { drawerOpen } from '$lib/stores/app';


    listen({ timer: 600_000 });

    onMount(() => {
        // listen to idleness in production mode;
        if (!dev) {
            // listen({ timer: 300_000 });
            const unsub = onIdle(() => goto("/auth/signout"));
            return unsub
        }
    })

</script>
<main class="w-screen h-screen flex overflow-hidden">
    <Sidebar class="flex-none hidden lg:flex flex-col w-64 h-screen print:hidden" />
    <section class="flex-1 dashboard overflow-y-scroll bg-sbg">
        <Header class="z-10 print:hidden" />
        <slot />
    </section>
</main>

<Drawer 
    transitionType="fly" 
    transitionParams = {{ x: -320, duration: 199, easing: sineIn }} 
    bind:hidden={$drawerOpen} 
    id="sidebar1"
    class="p-0">
    <Sidebar class="flex-none hidden lg:flex flex-col w-64 h-screen print:hidden" />
</Drawer>