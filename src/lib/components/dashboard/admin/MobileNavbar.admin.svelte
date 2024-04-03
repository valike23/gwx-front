<script>
    import {
        Dialog,
        DialogOverlay,
        Transition,
        TransitionChild
    } from "@rgossiaux/svelte-headlessui";
    import { UilBars, UilSetting } from "svelte-unicons";

    import Sidebar from "$lib/components/dashboard/admin/Sidebar.admin.svelte";
    import { Avatar, Badge, Button, Dropdown, DropdownItem, Popover } from "flowbite-svelte";
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { CheckmarkCircleSharp, SettingsOutline, SwapHorizontalOutline } from "svelte-ionicons";
    import { closeModal, showModal } from "$lib/stores/app";
    // import Quicklink from "./Quicklink.svelte";

    let isOpen = false;
    const user = $page.data.session.user;

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

<header class="shadow-sm z-10 bg-base-100 sticky top-0 w-full h-16 lg:hidden print:hidden">
    <nav class="h-full w-screen flex justify-center items-center px-4 relative">
        <button class="absolute left-1 btn btn-ghost top-2" on:click={() => (isOpen = true)}>
            <UilBars size="25" />
        </button>
        <div class="flex-1" />
        <!-- <Quicklink class="absolute right-6" /> -->
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
                    <span><SwapHorizontalOutline size="13" /></span>
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


<Transition 
    show={isOpen}
>
    <Dialog open={isOpen} on:close={() => (isOpen = false)} class="dialog place-content-start focus:outline-none">
        <DialogOverlay class="overlay"/>
        <div class="z-20">
            <TransitionChild
                enter="ease-out duration-200"
                enterFrom="-translate-x-40"
                enterTo="translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="-translate-x-10"
                leaveTo="-translate-x-80"
            >
            <div class="h-screen z-20">
                <Sidebar on:close={() => (isOpen = false)} />
            </div>
        </TransitionChild>
        </div>
    </Dialog>
</Transition>