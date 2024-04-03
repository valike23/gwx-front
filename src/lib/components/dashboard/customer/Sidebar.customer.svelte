<script>
    import { page } from '$app/stores';
    import { roles } from '$lib/data/roles';
    import { UilApps, UilArchive, UilChart, UilCoins, UilGlobe, UilParcel, UilPower, UilTruck, UilTruckLoading, UilUser, UilUsersAlt } from "svelte-unicons";

    $: user = $page.data.session.user;

    $: items = [
        {
            name: "Dashboard",
            icon: UilApps,
            active: $page.url.pathname == "/customer",
            to: "/customer",
            show: true
        },
        {
            name: "Waybills",
            icon: UilArchive,
            active: $page.url.pathname.startsWith("/customer/waybills"),
            to: "/customer/waybills",
            show: true
        },
        {
            name: "Applications",
            icon: UilFileAlt,
            active: $page.url.pathname.startsWith("/customer/waybills/applications"),
            to: "/customer/waybills/applications",
            show: true
        },
    ];

    function logout() {
        const res = confirm("Are you sure you want to logout? All unsaved changes will be lost.")
        if (res) {
            const uri = $page.url
            uri.pathname = "/auth/signout";
            window.location.href = uri.toString();
        }
    }
</script>

<aside class="w-64 h-screen bg-base-content scrollbar-hide overflow-y-scroll relative {$$props.class}">
    <div class="py-4 px-6">
        <img src="/images/logo.png" alt="GEX Logo" class="w-[130px]"/>
    </div>
    <ul class="px-4">
    {#each items.filter(e => e.show) as item}
        <li>
            <a 
                href="{item.to}" 
                class="flex gap-x-3 px-3 py-3 transition-all hover:bg-primary text-base-100 rounded-md mb-2 cursor-pointer items-center"
                class:bg-primary={item.active}
            >
                <svelte:component this={item.icon} size="17"/>
                <span class="text-sm">{ item.name }</span>
            </a>
        </li>
        <div class="divider" class:hidden={!item.divide}></div>
    {/each}
    </ul>

    <div class="h-[50px]"/>

    <div class="flex gap-x-3 absolute bottom-0 w-full px-3 py-2 items-center hover:bg-slate-900">
        <a href="/customer/profile" class="flex-none grid place-content-center w-9 h-9 rounded-full bg-slate-700 hover:bg-info hover:text-info-content">
            <span class="text-base-100"><UilUser size="15" /></span>
        </a>
        <div class="flex flex-col flex-1 py-3">
            <span class="text-base-100 text-xs line-clamp-1">{ user.name }</span>
            <span class="text-slate-400 text-2xs">{ roles[user.role] }</span> 
         </div>
        <button class="flex-none grid place-content-center w-9 h-9 rounded-full bg-slate-700 text-base-100 hover:bg-warning hover:text-warning-content" on:click={logout}>
            <span><UilPower size="15" /></span>
        </button>
    </div>
</aside>