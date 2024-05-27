<script>
    import dayjs from 'dayjs';
    import { UilAngleDown, UilAngleLeft, UilEditAlt, UilEnvelope, UilPhoneAlt } from "svelte-unicons";
    import { page } from "$app/stores";
    import { roles } from "$lib/data/roles";
    import { Breadcrumb, BreadcrumbItem, Button, Drawer, Dropdown, DropdownItem, Modal } from 'flowbite-svelte';
    import { closeModal, showModal } from '$lib/stores/app';
    import { clientFetch } from '$lib/client/api';
    import { failure, success } from '$lib/utils/toast';
    import EditUserDrawer from '$lib/components/dashboard/admin/EditUserDrawer.svelte';

    const user = $page.data.profile;
    let modalOpen = true;
    console.log('show more user details: ',user);

    async function doUpdate() {
        showModal();
        try {
            const res = await clientFetch({
                path: "/users/" + user.id,
                method: "PUT",
                body: {
                    status: user.status
                }
            });

            const json = await res.json();
            if (!res.ok) throw json;
            success("User updated successfully");
        } catch (error) {
            failure(error);
        } finally {
            closeModal()
        }
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/users">Users</BreadcrumbItem>
        <BreadcrumbItem>User Details</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-8">
        <div class="bg-base-100 flex-none w-full max-w-md shadow-sm rounded-md py-8 relative">
            <Button
                size="xs"
                class="absolute top-2 right-2"
                on:click={doUpdate}>
                Save
            </Button>
            <div class=" flex flex-col items-center justify-center mt-5">
                <div class="grid place-content-center w-14 h-14 bg-primary/50 rounded-lg shadow-sm text-primary-content text-2xl font-medium">
                    { user.name[0] }
                </div>
                <div class="text-center text-xs bg-info/5 px-2 py-2 rounded-md my-3">ID: { user.id }</div>
                <div class="bg-base-100 shadow-sm w-full p-4">
                    <h4 class="uppercase font-medium text-sm mb-4">Personal Information</h4> 
                    <div class="item-value">
                        <span class="title">Name </span>
                        <span class="value">{ user.name }</span>
                    </div>
                    <div class="item-value">
                        <span class="title">Role </span>
                        <span class="value">
                            <span class="text-xs px-3 py-2 rounded-md bg-base-200">{ roles[user.role] }</span>
                        </span>
                    </div>
                    <div class="item-value">
                        <span class="title">Contact Info </span>
                        <span class="value">
                            <span class="flex gap-x-3 items-center">
                                <span>
                                    <UilEnvelope size="18" />
                                </span>
                                <span>
                                    { user.email }
                                </span>
                            </span>
                            <span class="flex gap-x-3 items-center" class:hidden={!user.phone}>
                                <span>
                                    <UilPhoneAlt size="18" />
                                </span>
                                <span>
                                    { user.phone }
                                </span>
                            </span>
                        </span>
                    </div>
                    <div class="item-value">
                        <span class="title">Status </span>
                        <span class="value">
                            <Button
                                color="none"
                                size="xs"
                                class="capitalize flex gap-3 bg-slate-50">
                                <span>{user.status}</span>
                                <span><UilAngleDown /></span>
                            </Button>
                            <Dropdown>
                                {#each ["active","inactive"] as st}
                                <DropdownItem 
                                    class="capitalize"
                                    on:click={() => (user.status = st)}>
                                    { st }
                                </DropdownItem>
                                {/each}
                            </Dropdown>
                        </span>
                    </div>
                    <div class="item-value">
                        <span class="title">Date Created </span>
                        <span class="value">
                            { dayjs(user.created_at).format('DD-MM-YYYY') }
                        </span>
                    </div>
                    
                    <!-- <Button color="none" class="text-primary space-x-2 font-normal px-0 py-4">
                        <span><UilEditAlt size="20" /></span>
                        <span>Edit user info</span>
                    </Button> -->
                </div>
            </div>
        </div>
    </div>
    
</div>

<Modal 
    title="Update User"
    bind:open={modalOpen} size="xs" autoclose={false} class="w-full">
    <EditUserDrawer data={user} />
</Modal>


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