<script>
    import { page, navigating } from "$app/stores";
    import { sineIn } from 'svelte/easing';
    import { Drawer, Button, CloseButton, A, Avatar, Dropdown, Badge, DropdownItem } from 'flowbite-svelte';
    import { UilAngleDown, UilAngleRight, UilArrowRight, UilBell, UilDirection, UilDirections, UilEstate, UilLink, UilPackage, UilSlidersVAlt, UilTruckLoading, UilUsersAlt } from "svelte-unicons";
    import MobileNavbar from "$lib/components/dashboard/admin/MobileNavbar.admin.svelte";
    import SearchBox from "../SearchBox.svelte";
    import { CheckmarkCircleSharp, NotificationsOutline, SettingsOutline, SwapHorizontal } from "svelte-ionicons";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { setUser } from "$lib/stores/user";
    import { closeModal, showModal } from "$lib/stores/app";
    import NotificationsSnippet from "../common/NotificationsSnippet.svelte";

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
                    href: "/track"
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

    async function switchProfile(hash) {
        showModal();
        try {
            await clientFetch({
                path: "/auth/session",
                method: "POST",
                body: { hash }
            });

            // reload the admin dashboard
            const url = $page.url;
            url.pathname = "/admin";
            window.location.href = url.toString();

        } catch (error) {
            failure(error);
        } finally {
            closeModal();
        }
    }
</script>

<MobileNavbar />

<header class="{`h-16 bg-base-100 sticky top-0 shadow-sm hidden lg:block ${$$props.class}`}">
    <nav class="w-full h-full flex px-4 items-center gap-x-4">
        <div class="flex flex-col">
            <span class="text-xs text-base-content/30">Welcome Back</span>
            <span class="text-sm"> <strong>{ user.name }</strong></span>
        </div>
        <div class="flex-1 px-4">
            <SearchBox class="hidden"/>
        </div>
        <NotificationsSnippet />
        <!-- <Quicklink /> -->
        <Button color="primary" outline size="sm" class="bg-primary/5 text-primary font-normal space-x-1 border-none hover:bg-primary/10 hover:text-primary-700" on:click={() => (hideMenu = false)}>
            <span>Quick Links</span>
            <span><UilAngleDown /></span>
        </Button>
        <div>
            <Avatar id="profile-avatar" size="xs" class="ring-2 ring-offset-1 ring-slate-200" />
            <Dropdown
                triggeredBy="#profile-avatar">
                <div slot="header" class="w-64 flex flex-col items-center h-32 justify-center bg-slate-100 p-4 relative">
                    <Avatar size="sm" class="mb-3 ring-4 ring-offset-2 ring-slate-300" />
                    <div class="text-sm">{ user.name }</div>
                    <div class="text-xs text-gray-400 truncate">{ user.email }</div>
                    <Badge class="absolute top-2 right-2" color="blue">Default</Badge>
                </div>
                <DropdownItem href="/admin/settings" class="flex gap-2 items-center">
                    <span class="text-blue-500"><SettingsOutline size="18" /></span>
                    Settings
                </DropdownItem>
                {#if user.acls.length}
                <div class="px-4 text-xs text-gray-400 pt-4 flex gap-2 items-center">
                    <span><SwapHorizontal size="13" /></span>
                    Switch Accounts
                </div>
                <div class="divide-y pt-2">
                    <DropdownItem 
                    disabled={!user.acls.find(e => e.active)}
                    active={!user.acls.find(e => e.active)}
                    on:click={() => switchProfile("me")}
                    class="flex gap-3 items-center { !user.acls.find(e => e.active) ? 'bg-slate-100' : '' }">
                    <Avatar size="xs" />
                    <div class="flex-1">
                        <div>{ user.name }</div>
                        <div class="text-xs font-light text-gray-400 capitalize">main account</div>
                    </div>
                    <span class="text-success" class:hidden={user.acls.find(e => e.active)}>
                        <CheckmarkCircleSharp size="17" />
                    </span>
                </DropdownItem>
                {#each user.acls as acl }
                <DropdownItem 
                    disabled={acl.active}
                    active={acl.active}
                    on:click={() => switchProfile(acl.hash)}
                    class="flex gap-3 items-center { acl.active ? 'bg-slate-100' : '' }">
                    <Avatar size="xs" />
                    <div class="flex-1">
                        <div>{ acl.name }</div>
                        <div class="text-xs font-light text-gray-400 capitalize">{ acl.scope }</div>
                    </div>
                    <span class="text-success" class:hidden={!acl.active}>
                        <CheckmarkCircleSharp size="17" />
                    </span>
                </DropdownItem>
                {/each}
                </div>
                {/if} 
            </Dropdown>
        </div>
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