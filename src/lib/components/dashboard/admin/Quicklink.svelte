<script>
    import { page } from '$app/stores';
    import {
        Popover,
        PopoverButton,
        PopoverOverlay,
        PopoverPanel
    } from '@rgossiaux/svelte-headlessui'
    import { UilAngleDown, UilAngleRight, UilArchive, UilMapMarker, UilPackage, UilTruckLoading, UilUser, UilUsersAlt } from "svelte-unicons";
    import { roles } from '$lib/data/roles';

    $: user = $page.data.session.user;
    $: items = [
        {
            title: "Create Package",
            subtitle: "Create a new package and generate a waybill number",
            icon: UilArchive,
            to: "/admin/waybills/create",
            show: true
        },
        {
            title: "Track Delivery",
            subtitle: "Track a delivery by waybill number or package ID",
            icon: UilMapMarker,
            to: "/admin/shipments/track",
            show: true
        },
        {
            title: "Manage Users",
            subtitle: "Manage application users",
            icon: UilUsersAlt,
            to: "/admin/users",
        },
        {
            title: "Manage Shipments",
            subtitle: "Manager all shipments",
            icon: UilTruckLoading,
            to: "/admin/shipments",
        }
    ]
</script>

<div {...$$restProps}>
<Popover class="relative">
    <PopoverButton 
        class="flex py-2 bg-primary/5 px-3 text-sm text-primary items-center gap-x-2 rounded-md hover:bg-primary/10"
    >
        Quick Actions
        <span><UilAngleDown /></span>
    </PopoverButton>
    <PopoverOverlay class="fixed inset-0 bg-black opacity-5"/>
    <PopoverPanel class="absolute top-14 right-[2px] z-10 bg-base-100 shadow-sm rounded-md w-72 overflow-hidden">
        <div class="w-full">
            {#each items as item }
            <PopoverButton as="a" href="{item.to}" class="flex gap-x-4 py-4 px-6 hover:bg-base-200/10">
                <span class="flex-none w-10 h-10 rounded-lg bg-primary/5 text-primary grid place-content-center">
                    <svelte:component this={item.icon} size="20" />
                </span>
                <div class="flex flex-col gap-y-[2px]">
                    <span class="font-medium text-sm">{ item.title }</span>
                    <span class="text-base-content/30 text-xs line-clamp-2">{ item.subtitle }</span>
                </div>
            </PopoverButton>
            {/each}
        </div>
        <PopoverButton as="a" href="/admin/settings" class="flex bg-base-200/10 px-6 py-4 gap-x-4">
            <span class="flex-none w-10 h-10 grid place-content-center text-base-content/30 bg-base-200 rounded-full">
                <UilUser size="20"/>
            </span>
            <div class="flex flex-col flex-1">
                <span class="font-medium text-sm">{ user.name }</span>
                <span class="text-base-content/30 text-xs line-clamp-2">{ roles[user.role] }</span>
            </div>
            <span class="flex-none w-6 h-10 grid place-content-center text-base-content/30">
                <UilAngleRight size="20" />
            </span>
        </PopoverButton>
    </PopoverPanel>
</Popover>
</div>