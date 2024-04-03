<script>
    import { page, navigating } from "$app/stores";
    import { sineIn } from 'svelte/easing';
    import { Drawer, Button, CloseButton, A } from 'flowbite-svelte';
    import { UilAngleDown, UilAngleRight, UilBell, UilDirections, UilLink, UilPackage, UilSlidersVAlt, UilTruckLoading, UilUsersAlt } from "svelte-unicons";
    import MobileNavbar from "$lib/components/dashboard/admin/MobileNavbar.admin.svelte";
    import SearchBox from "../SearchBox.svelte";

    $: user = $page.data.session.user;

    let hideMenu = true; 
    const transitionParams = {
        y: -320,
        duration: 200,
        easing: sineIn
    };

    $: {
        if ($navigating) {
            hideMenu = true;
        }
    }

    const menu = [
        {
            icon: UilUsersAlt,
            title: "User Management",
            items: [
                {
                    icon: UilLink,
                    title: "Manage app users",
                    subtitle: "List all app users: admin, hubmanagers and riders",
                    href: "/admin/users"
                },
                {
                    icon: UilLink,
                    title: "Customers management",
                    subtitle: "See a list of all customers, individuals and businesses.",
                    href: "/admin/customers"
                }
            ]
        },
        {
            icon: UilPackage,
            title: "Waybills",
            items: [
                {
                    icon: UilLink,
                    title: "Manage Waybills",
                    subtitle: "List and manage all generated waybills.",
                    href: "/admin/waybills"
                },
                {
                    icon: UilLink,
                    title: "Track Packages",
                    subtitle: "Track waybill statuses via the tracking and waybill number.",
                    href: "/admin/waybills/track"
                }
            ]
        },
        {
            icon: UilDirections,
            title: "Terminals",
            items: [
                {
                    icon: UilLink,
                    title: "Manage Stations",
                    subtitle: "Manage all stations and terminals and see their performance overview",
                    href: "/admin/terminals"
                },
                // {
                //     icon: UilLink,
                //     title: "Manage Stations",
                //     subtitle: "Manage all stations and terminals and see their performance overview"
                // }
            ]
        },
        {
            icon: UilTruckLoading,
            title: "Shipment & Deliveries",
            items: [
                {
                    icon: UilLink,
                    title: "Shipments Overview",
                    subtitle: "List all shipments and monitor progress",
                    href: "/admin/shipments"
                },
                {
                    icon: UilLink,
                    title: "Manage Deliveries",
                    subtitle: "List and manage all last mile deliveries, assign to riders",
                    href: "/admin/deliveries"
                }
            ]
        },
        {
            icon: UilSlidersVAlt,
            title: "Setup",
            items: [
                {
                    icon: UilLink,
                    title: "Manage countries",
                    subtitle: "Manage countries",
                    href: "/admin/countries"
                },
            ]
        },
    ]
</script>

<MobileNavbar />

<header class="{`h-16 bg-base-100 sticky top-0 shadow-sm hidden lg:block ${$$props.class}`}">
    <nav class="w-full h-full flex px-4 items-center gap-x-4">
        <div class="flex flex-col">
            <span class="text-xs text-base-content/30">Welcome Back</span>
            <span class="text-sm"> <strong>{ user.name }</strong></span>
        </div>
        <div class="flex-1 px-4">
            <SearchBox />
        </div>
        <button class="btn btn-ghost btn-circle">
            <span class="text-base-content/70"><UilBell size="22" /></span>
        </button>
        <!-- <Quicklink /> -->
        <Button color="primary" outline size="sm" class="bg-primary/5 text-primary font-normal space-x-1 border-none hover:bg-primary/10 hover:text-primary-700" on:click={() => (hideMenu = false)}>
            <span>Quick Links</span>
            <span><UilAngleDown /></span>
        </Button>
    </nav>
</header>

<Drawer
    placement="top"
    transitionType="fly"
    {transitionParams}
    bind:hidden={hideMenu}
    topOffset={65}
    width="w-full max-w-[800px] mx-auto rounded-xl shadow-md"
>
    <div>
        <div class="flex justify-between items-center">
            <h3 class="font-semibold pl-3">Quick Actions</h3>
            <CloseButton on:click={() => (hideMenu = true)}/>
        </div>
        <div class="grid grid-cols-2 gap-6 p-8 ">
            {#each menu as m }
            <div class="text-sm">
                <div class="flex space-x-2 items-center mb-3">
                    <span class="w-7 h-7 grid place-content-center rounded-md bg-primary/5  text-primary">
                        <svelte:component this={m.icon} size="16" />
                    </span>
                    <div class="font-medium">{ m.title }</div>
                </div>
                
                {#each m.items as item }
                <a href="{item.href}" class="flex gap-x-4 hover:bg-slate-50 px-6 py-3 rounded-lg transition-all items-center mega">
                    <div class="flex-1">
                        <div class="text-sm">{ item.title }</div>
                        <!-- <div class="text-xs text-base-content/50">{ item.subtitle }</div> -->
                    </div>
                    <span class="icon text-base-100 transition-all">
                        <UilAngleRight size="20" />
                    </span>
                </a>
                {/each}
            </div>
            {/each}
        </div>
    </div>
</Drawer>

<style lang="postcss">
    .mega:hover .icon {
        @apply text-primary;
    }
</style>