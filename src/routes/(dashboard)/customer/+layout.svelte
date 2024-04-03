<script>
    import Sidebar from "$lib/components/dashboard/customer/Sidebar.customer.svelte";
    import Header from "$lib/components/dashboard/customer/Header.customer.svelte";
    import { UilApps, UilArchiveAlt, UilParcel, UilSetting } from "svelte-unicons";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    $: items = [
        {
            title: "Dashboard",
            icon: UilApps,
            to: "/customer",
            active: $page.url.pathname == "/customer"
        },
        {
            title: "Waybills",
            icon: UilArchiveAlt,
            to: "/customer/waybills",
            active: $page.url.pathname.startsWith("/customer/waybills")
        },
        {
            title: "Settings",
            icon: UilSetting,
            to: "/customer/settings",
            active: $page.url.pathname.startsWith("/customer/settings")
        }
    ];
</script>

<main class="w-screen h-screen flex overflow-hidden">
    <!-- <Sidebar class="flex-none hidden lg:block w-64 h-screen" /> -->
    <section class="flex-1 dashboard overflow-y-scroll bg-sbg">
        <Header class="z-10" />
        <slot />
        <div class="h-14 md:hidden" />
    </section>
</main>

<footer class="btm-nav md:hidden">
    {#each items as item }
    <button 
        class="transition-all"
        class:text-primary={item.active}
        class:font-medium={item.active}
        class:active={item.active} 
        on:click={() => goto(item.to)}
    >
        <svelte:component this={item.icon} size="18" />
        <span class="btm-nav-label text-xs">{ item.title }</span>
    </button>
    {/each}
</footer>