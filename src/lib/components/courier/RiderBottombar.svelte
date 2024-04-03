<script>
    import { page } from "$app/stores";
    import { UilHistory, UilSetting, UilTruck, UilUser } from "svelte-unicons";

    $: items = [
        {
            title: "Deliveries",
            icon: UilTruck,
            active: $page.url.pathname == "/courier",
            to: "/courier"
        },
        {
            title: "History",
            icon: UilHistory,
            active: $page.url.pathname == "/courier/deliveries",
            to: "/courier/deliveries"
        },
        {
            title: "Settings",
            icon: UilSetting,
            active: $page.url.pathname == "/courier/settings",
            to: "/courier/settings"
        }
    ];
</script>
{#if ["/courier", "/courier/deliveries", "/courier/settings"].includes($page.url.pathname)}
<nav class="h-16 fixed bottom-2 left-4 right-4 rounded-xl shadow-md bg-base-100">
    <ul class="grid grid-cols-3 grid-cols-{items.length} w-full h-full overflow-hidden rounded-lg shadow-sm">
        {#each items as item }
        <li >
            <a href="{ item.to }" class="h-full flex flex-col items-center justify-center gap-y-1" class:text-primary={item.active}>
                <span><svelte:component this={item.icon} size="20" /></span>
                <span class="text-xs">{ item.title }</span>
            </a>
        </li>
        {/each}
    </ul>
</nav>
{/if}