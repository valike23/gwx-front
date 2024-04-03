<script>
    import {
        Popover,
        PopoverButton,
        PopoverOverlay,
        PopoverPanel
    } from '@rgossiaux/svelte-headlessui'
    import { page } from "$app/stores";
    import { UilAngleDown, UilArchive, UilBell, UilDashboard, UilFileAlt, UilPower, UilSetting } from "svelte-unicons";
    import MobileNavbar from "$lib/components/dashboard/customer/MobileNavbar.customer.svelte";
    import { roles } from '$lib/data/roles';
    import { getInitials } from '$lib/utils/helpers';

    $: user = $page.data.session.user;

    $: items = [
        {
            name: "Dashboard",
            icon: UilDashboard,
            active: $page.url.pathname == "/customer",
            to: "/customer",
            show: true
        },
        {
            name: "Waybills",
            icon: UilArchive,
            active: $page.url.pathname == ("/customer/waybills"),
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

<MobileNavbar />

<header class="{`h-16 bg-base-100 sticky top-0 shadow-sm hidden md:block ${$$props.class}`}">
    <nav class="w-full h-full flex px-4 items-center gap-x-4">

        <div class="">
            <img src="/images/logo.png" alt="GEX Logo" class="w-[90px]"/>
        </div>

        <ul class="flex h-full">
            {#each items.filter(e => e.show) as item }
            <li 
                class="px-3 pt-1 border-b-2 border-transparent h-full flex flex-col justify-center transition-all focus:border-none text-base-content/70"
                class:border-b-primary={item.active}
                class:text-primary={item.active}
            >
                <a href="{item.to}" class="flex gap-x-2 items-center transition-all">
                    <span><svelte:component this={item.icon} size="20"/></span>
                    <span class="uppercase text-sm">{ item.name }</span>
                </a>
            </li>
            {/each}
        </ul>

        <div class="flex-1" />
        <button class="btn btn-ghost btn-circle">
            <span class="text-base-content/70"><UilBell size="22" /></span>
        </button>
        <!-- <Quicklink /> -->
        <Popover class="relative">
            <PopoverButton 
                class="flex items-center gap-x-4"
            >
                <div class="avatar placeholder">
                    <div class="w-9 h-9 rounded-full bg-slate-100">
                        <span class="font-medium text-sm">{ getInitials(user.name) }</span>
                    </div>
                </div>
                <div class="flex flex-col items-start">
                    <div class="text-xs font-medium">{ user.name }</div>
                    <div class="text-xs text-base-content/40">{ roles[user.role] }</div>
                </div>
                
                <span class="text-base-content/50"><UilAngleDown size="23" /></span>
            </PopoverButton>
            <PopoverOverlay class="fixed inset-0 bg-black opacity-5"/>
            <PopoverPanel class="absolute top-14 right-[2px] z-10 bg-base-100 shadow-sm rounded-md w-52 overflow-hidden">
                <div class="w-full">
                    <PopoverButton as="a" href="/customer/settings">
                        <div class="d-item">
                            <span class="flex-none grid place-content-center w-8 h-8 rounded-full bg-slate-50 hover:bg-accent/10">
                                <UilSetting size="15" />
                            </span>
                            <div>Settings</div>
                        </div>
                    </PopoverButton>
                    <PopoverButton on:click={logout} class="w-full">
                        <div class="d-item">
                            <span class="flex-none grid place-content-center w-8 h-8 rounded-full bg-error/20 hover:bg-error hover:text-slate-50">
                                <UilPower size="15" />
                            </span>
                            <div>Logout</div>
                        </div>
                    </PopoverButton>
                </div>
            </PopoverPanel>
        </Popover>
    </nav>
</header>

<style lang="postcss">
.d-item {
    @apply px-4 py-3 flex gap-x-3 items-center text-sm hover:bg-slate-50;
}
</style>