<script>
    import { page } from "$app/stores";
    import { getInitials } from "$lib/utils/helpers";
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import { UilEnvelope, UilPen, UilPhone } from "svelte-unicons";

    let user = $page.data.session.user;
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Settings</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="mx-auto flex flex-col items-center mb-6">
        <div class="avatar placeholder">
            <div class="w-16 h-16 rounded-lg bg-primary/50 text-slate-50">
                { getInitials(user.name) }
            </div>
        </div>
        <h3 class="font-semibold mt-4 mb-1">Welcome, { user.name }</h3>
        <p class="text-xs text-base-content/50">Manage your personal information and account security.</p>
    </div>
    <div class="bg-base-100 shadow-sm rounded-md p-8 mx-auto max-w-2xl">
        <h2 class="uppercase font-medium text-sm mb-6">Customer Information</h2>

        <div class="info-item">
            <span class="title">Name</span>
            <div class="content">
                <span>{ user.name }</span>
            </div>
        </div>

        <div class="info-item">
            <span class="title">Contact info</span>
            <div class="content">
                <div class="flex items-center gap-x-2">
                    <span><UilEnvelope size="18"/></span>
                    <span>{ user.email }</span>
                </div>
                <div class="flex items-center gap-x-2">
                    <span><UilPhone size="18"/></span>
                    <span class:fade={!user.phone} >{ user.phone || "Not set" }</span>
                </div>
                
            </div>
        </div>

        <div class="info-item">
            <span class="title">Department</span>
            <div class="content">
                <span class:fade={!user.department} >{ user.department || "Not set" }</span>
            </div>
        </div>

        <div class="info-item">
            <span class="title">Address</span>
            <div class="content">
                <span class:fade={!user.address} >{ user.address || "Not set" }</span>
            </div>
        </div>

        <div class="info-item">
            <span class="title">State</span>
            <div class="content">
                <span class:fade={!user.state} >{ user.state || "Not set" }</span>
            </div>
        </div>

        <div class="info-item">
            <span class="title">Country</span>
            <div class="content">
                <span class:fade={!user.country} >{ user.country || "Not set" }</span>
            </div>
        </div>

        <div class="flex py-4">
            <a href="/admin/settings/profile" class="bg-primary/5 text-primary flex items-center text-sm px-3 py-3 gap-3 rounded-md">
                <span><UilPen size="20"/></span>
                <span>Update your information</span>
            </a>
            
        </div>
    </div>
</div>

<style lang="postcss">
.info-item {
    @apply flex py-5 border-b border-b-slate-50;
}
.info-item .title {
    @apply flex-none w-28 sm:w-36 text-xs uppercase text-base-content/60 pt-1;
}
.info-item .content {
    @apply text-sm flex flex-col items-start text-base-content/75 gap-y-2;
}
.info-item .content .fade {
    @apply text-base-content/40 italic;
}
</style>