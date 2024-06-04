<script>
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import TerminalAdminDrawer from "$lib/components/dashboard/admin/TerminalAdminDrawer.svelte";
    import TerminalDrawer from "$lib/components/dashboard/admin/TerminalDrawer.svelte";
    import { closeModal, showModal } from "$lib/stores/app";
    import { failure, success } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import { Avatar, Breadcrumb, BreadcrumbItem, Button, Drawer } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilEditAlt, UilPlus, UilTrashAlt, UilUserPlus } from "svelte-unicons";
    import { sineIn } from 'svelte/easing';

    const hub = ($page.data.hub)[0];
    console.log("the hub", hub);
    let users = [];
    let hideDrawer = true;
    let hideEdit = true;

    onMount(() => {
        getUsers();
    })

    function statusClass(val) {
        switch (val) {
            case "active": return "bg-success/5 px-3 py-1 text-2xs text-success ";
            case "inactive": return "bg-warning/5 px-3 py-1 text-2xs text-warning ";
            default: return "bg-success"
        }
    }

    function getUsers() {
         clientFetch({
            path: `/hubs/${hub.id}/users`,
            query: {
                limit: 50
            }
         })
         .then(res => res.json())
         .then(json => {
            if (json.results) {
                users = json.results;
            }
         })
    }

    async function deleteUser(uid) {
        const res = confirm("Are you sure you want to remove this user?");
        if (!res) return;
        showModal();

        try {
            const res = await clientFetch({
                path: `/hubs/${$page.params.id}/users/${uid}`,
                method: "DELETE"
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success(json.message || "User removed successfully");
        } catch (error) {
            failure(error);
        } finally {
            closeModal();
            getUsers()
        }
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/terminals">Terminals</BreadcrumbItem>
        <BreadcrumbItem>Terminal Details</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">

    <div class="flex gap-1">
        <div class="bg-slate-50 flex-none w-full max-w-sm shadow-sm rounded-lg py-8 relative">
            <div class="absolute right-2 top-3">
                <Button
                    size="xs" 
                    class="w-8 h-8 rounded-full"
                    on:click={() => (hideEdit = false)}
                    outline>
                    <span><UilEditAlt size="18" /></span>
                </Button>
            </div>
            <div class=" flex flex-col items-center justify-center mt-5">
                <div class="grid place-content-center w-14 h-14 bg-accent rounded-lg shadow-sm text-primary-content text-2xl font-medium">
                    { hub.code.split(" ").map(e => e[0]).join("") }
                </div>
                <div class="text-center text-xs bg-info/5 px-2 py-2 rounded-md my-3">ID: { hub.id }</div>
                <div class="p-4 w-full">
                    <div class="item-value">
                        <span class="title">Status </span>
                        <span class="value">
                            <span class="{statusClass(hub.status)}  rounded-md capitalize">
                                { hub.status }</span>
                        </span>
                    </div>
                    <div class="item-value">
                        <span class="title">Name </span>
                        <span class="value">{ hub.name }</span>
                    </div>
                    <div class="item-value">
                        <span class="title">Code </span>
                        <span class="value">{ hub.code }</span>
                    </div>
                    <div class="item-value">
                        <span class="title">Address </span>
                        <span class="value">{ hub.address }</span>
                    </div>
                    <div class="item-value">
                        <span class="title">Date Created </span>
                        <span class="value">
                            { dayjs(hub.created_at).format('DD-MM-YYYY') }
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-1">
            <div class="flex justify-between items-center">
                <h3 class="font-medium px-6 py-4">Terminal Admins</h3>
               
            </div>
            
            <div>
                <table class="table custom mt-3 table-xs">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Date Added</th>
                            <th>Role</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each users as item}
                        <tr>
                            <td>
                                <div class="flex items-center gap-x-4">
                                    <Avatar size="sm" />
                                    <div class="text-xs">
                                        <div class="font-medium">{ item.user.name }</div>
                                        <div class="text-base-content/40 text-xs">{ item.user.email }</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span>{ dayjs(item.created_at).format("DD-MM-YYYY") }</span>
                            </td>
                            <td>
                                <span class="bg-info/5 rounded-md px-2 py-1 text-xs">{ item.role }</span>
                            </td>
                            <td>
                                <Button size="xs" class="p-2 bg-primary-100 text-primary hover:text-white" on:click={() => (deleteUser(item.user.id))}>
                                    <UilTrashAlt size="17" />
                                </Button>
                            </td>
                        </tr>                   
                        {/each}
                    </tbody>
                </table>
                {#if !users.length}
                    <div class="flex flex-col items-center justify-center min-h-[150px]">
                        <p class="text-xs italic text-gray-500 pb-1">You have not added any user yet.</p>
                        <Button color="none" class="text-xs gap-2 items-center text-gray-400" on:click={() => (hideDrawer = false)}>
                            <span><UilUserPlus size="16" /> </span>
                            Add User
                        </Button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<Drawer
    bind:hidden={hideDrawer} 
    placement="right" 
    transitionType="fly"
    activateClickOutside={false}
    transitionParams={{ x: 320, duration: 200, easing: sineIn }}
    width="w-full max-w-[380px]"
>
    <TerminalAdminDrawer on:close={(e) => {
        hideDrawer = true;
        if (e.detail) getUsers();
    }} />
</Drawer>

<Drawer
    bind:hidden={hideEdit} 
    placement="right" 
    transitionType="fly"
    activateClickOutside={false}
    transitionParams={{ x: 320, duration: 200, easing: sineIn }}
    width="w-full max-w-[380px]"
>
    <TerminalDrawer data={hub} on:close={(e) => {
        hideEdit = true;
        if (e.detail) {
            window.location.reload();
        }   
    }} />
</Drawer>

<style lang="postcss" scoped>
    .item-value {
        @apply flex flex-col md:flex-row gap-y-2 gap-x-3 items-start py-4 border-b border-b-base-content/10;
    }
    .item-value .title {
        @apply w-32 uppercase pt-1 text-xs font-semibold flex-none text-base-content/60;
    }
    .item-value .value {
        @apply text-xs text-gray-500 flex flex-col gap-3;
    }
</style>