<script>
    import { page } from '$app/stores';
    import { roles } from '$lib/data/roles';
    import { toggleDrawer } from '$lib/stores/app';
    import { UilApps, UilArchive, UilChart, UilDirections, UilGlobe, UilPower, UilTruck, UilTruckLoading, UilUser } from "svelte-unicons";

    $: user = $page.data.session.user;
    $: activeUrl = $page.url.pathname;
    $: items = [
        {
            name: "Dashboard",
            icon: UilApps,
            active: $page.url.pathname == "/manager",
            to: "/manager",
        },
        {
            name: "Waybills",
            icon: UilArchive,
            active: $page.url.pathname.startsWith("/manager/waybills"),
            to: "/manager/waybills",
            items: [
                {
                    name: "Manage Waybills",
                    href: "/manager/waybills",
                    show: true,
                    active: $page.url.pathname == ("/manager/waybills"),
                },
                {
                    name: "Bulk Upload",
                    href: "/manager/waybills/bulk",
                    show: true,
                    active: $page.url.pathname == ("/manager/waybills/bulk"),
                },
                {
                    name: "NIS Applications",
                    href: "/manager/waybills/applications",
                    show: true,
                    active: $page.url.pathname.startsWith("/manager/waybills/applications"),
                },
            ]
        },
        {
            name: "Shipments",
            icon: UilTruckLoading,
            active: $page.url.pathname.startsWith("/manager/shipments"),
            to: "/manager/shipments",
        },
        {
            name: "Deliveries",
            icon: UilTruck,
            active: $page.url.pathname.startsWith("/manager/deliveries"),
            to: "/manager/deliveries",
            divide: true,
        },
        {
            name: "User Management",
            icon: UilChart,
            show: true,
            items: [
                {
                    name: "Users",
                    href: "/manager/users",
                    show: true,
                    active: $page.url.pathname.startsWith("/manager/users"),
                },
                // {
                //     name: "Customers",
                //     href: "/manager/customers",
                //     show: true,
                //     active: $page.url.pathname.startsWith("/manager/customers"),
                // }
            ]
        },
        {
            name: "Reports",
            icon: UilChart,
            active: $page.url.pathname.startsWith("/manager/reports"),
            to: "/manager/reports",
            items: [
                {
                    name: "Overview",
                    href: "/manager/reports",
                    show: true,
                    active: activeUrl == ("/manager/reports"),
                },
                {
                    name: "Waybills",
                    href: "/manager/reports/waybills",
                    show: true,
                    active: activeUrl == ("/manager/reports/waybills"),
                },
                // {
                //     name: "Deliveries",
                //     href: "/manager/reports/deliveries",
                //     show: true,
                //     active: activeUrl == ("/manager/reports/deliveries"),
                // },
            ]
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
    let activeIndex = 0;
</script>

<aside class="w-72 h-screen bg-base-content scrollbar-hide overflow-y-scroll flex flex-col relative {$$props.class || ''}">
    <div class="py-4 px-6">
        <img src="/images/logo.png" alt="GEX Logo" class="w-[130px]"/>
    </div>
    <div class="px-4 space-y-3 flex-1">
    {#each items as item, index}
        {#if item.items}
        <div
            class:text-secondary={activeIndex != index}
            class="custom collapse collapse-arrow"
        >
            <input
                type="radio"
                name="my-side-menu"
                checked={index == activeIndex}
            />
            <div class="collapse-title">
                <button
                    class="w-[calc(100%+60px)] p-3 rounded-md overflow-hidden flex -ml-4 items-center gap-x-3 text-sm {activeIndex == index ? 'bg-primary font-semibold text-white' : 'text-base-100'}"
                    on:click={() => (activeIndex = index)}
                >
                    <span>
                        <svelte:component
                            this={item.icon}
                            size="18"
                        />
                    </span>
                    <span>{item.name}</span>
                </button>
            </div>
            <div class="collapse-content pt-4">
                <div class="relative space-y-3 pl-2 pt-4">
                    {#each item.items as i}
                        <div class="flex gap-4 items-center ml-3">
                            <a
                                href={i.href}
                                on:click={() => (toggleDrawer(true))}
                                class="flex-1 {i.active
                                    ? 'bg-primary/20 font-semibold text-gray-100'
                                    : 'text-gray-300'} p-3 rounded-lg text-sm"
                            >
                                {i.name}
                            </a>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="divider" class:hidden={!item.divide}></div>
        </div>
        {:else}
        <div>
            <a 
                href="{item.to}" 
                class="flex gap-x-3 px-3 py-3 transition-all hover:bg-primary text-base-100 rounded-md mb-2 cursor-pointer items-center"
                class:bg-primary={item.active}
            >
                <svelte:component this={item.icon} size="17"/>
                <span class="text-sm">{ item.name }</span>
            </a>
        </div>
        <div class="divider" class:hidden={!item.divide}></div>
        {/if}
    {/each}
    </div>

    <div class="h-[50px]"/>

    <div class="flex gap-x-3 sticky bottom-0 w-full px-3 py-2 items-center hover:bg-slate-900 bg-base-content">
        <a href="/manager/settings" class="flex-none grid place-content-center w-9 h-9 rounded-full bg-slate-700 hover:bg-info hover:text-info-content">
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

<style lang="postcss">
    div.custom.collapse {
        border-radius: 0px !important;
    }
    div.custom.collapse > .collapse-title {
        @apply h-auto min-h-[auto] rounded-none;
    }
    div.custom.collapse > .collapse-title > button {
        position: absolute;
        top: 0;
        width: 100%;
    }
    div.custom.collapse-arrow > .collapse-title:after {
        top: 68%;
        @apply text-base-100;
    }
    div.custom.collapse > .collapse-content {
        @apply -ml-2;
    }
    div.custom > input[type="radio"] {
        min-height: auto;
        height: 20px;
    }
</style>