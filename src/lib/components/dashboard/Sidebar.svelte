<script>
    import { page } from '$app/stores';
    import { roles } from '$lib/data/roles';
    import { UilApps, UilArchive, UilBuilding, UilCoins, UilParcel, UilSetting, UilSignout, UilTruck, UilTruckLoading, UilUser } from "svelte-unicons";

    $: user = $page.data.session.user;
    console.log("the user role is", user);
    $: items = [
        {
            name: "Dashboard",
            icon: UilApps,
            active: $page.url.pathname == "/dashboard",
            to: "/dashboard",
            show: true,
        },
        {
            name: "Packages",
            icon: UilArchive,
            active: $page.url.pathname.startsWith("/dashboard/packages"),
            to: "/dashboard/packages",
            show: true,
        },
        {
            name: "Shipments",
            icon: UilTruck,
            active: $page.url.pathname.startsWith("/dashboard/shipments"),
            to: "/dashboard/shipments",
            show: true,
        },
        {
            name: "Manifests",
            icon: UilParcel,
            active: $page.url.pathname.startsWith("/dashboard/manifests"),
            to: "/dashboard/manifests",
            divide: user.role === "user",
            show: user.role === "admin",
        },
        {
            name: "Offices",
            icon: UilBuilding,
            active: $page.url.pathname.startsWith("/dashboard/offices"),
            to: "/dashboard/offices",
            show: user.role === "admin",
        },
        {
            name: "Rates",
            icon: UilCoins,
            active: $page.url.pathname.startsWith("/dashboard/rates"),
            to: "/dashboard/rates",
            divide: true,
            show: user.role === "admin",
        },
        {
            name: "Terminals",
            icon: UilTruckLoading,
            active: $page.url.pathname.startsWith("/dashboard/terminals"),
            to: "/dashboard/terminals",
            show: user.role == "admin",
        },
        {
            name: "Customers",
            icon: UilUser,
            active: $page.url.pathname.startsWith("/dashboard/customers"),
            to: "/dashboard/customers",
            divide: true,
            show: user.role === "admin",
        },
        {
            name: "Sign Out",
            icon: UilSignout,
            to: "/auth/signout",
            show: true,
        }
    ];
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
    <a href="/dashboard/settings" class="absolute bottom-0 w-full flex px-6 py-3 gap-4 items-center hover:bg-slate-900">
        <div class="grid place-content-center w-9 h-9 rounded-full bg-slate-600">
            <span class="text-base-100"><UilSetting size="20" /></span>
        </div>
        <div class="flex flex-col flex-1">
           <span class="text-base-100 text-xs">{ user.name }</span>
           <span class="text-slate-400 text-2xs">{ roles[user.role] }</span> 
        </div>
    </a>
</aside>