<script>
    import { page } from "$app/stores";
    import { getInitials } from "$lib/utils/helpers";
    import { UilEnvelope, UilLock, UilPen, UilPhone, UilSignOutAlt } from "svelte-unicons";

    let user = $page.data.session.user;

    function logout() {
        const res = confirm("Are you sure you want to logout? All unsaved changes will be lost.")
        if (res) {
            const uri = $page.url
            uri.pathname = "/auth/signout";
            window.location.href = uri.toString();
        }
    }
</script>

<div class="h-14 shadow-sm bg-base-100 sticky top-0 w-full flex items-center justify-between px-4 z-10">
    <h3 class="text-primary">Settings</h3>
</div>

<div class="page">
    <div class="mx-auto flex flex-col items-center mb-6">
        <div class="avatar placeholder">
            <div class="w-16 h-16 rounded-lg bg-primary/50 text-slate-50">
                { getInitials(user.name) }
            </div>
        </div>
        <h3 class="font-semibold mt-4 mb-1">Welcome, { user.name }</h3>
        <p class="text-xs text-base-content/50 text-center">Manage your personal information and account security.</p>
    </div>
    <div class="flex py-2 justify-end">
        <a href="/courier/settings/profile" class="bg-primary/5 text-primary flex items-center text-xs px-3 py-3 space-x-2 rounded-md">
            <span><UilPen size="15"/></span>
            <span>Edit Profile</span>
        </a>
        
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
        <div class="">
            <h2 class="uppercase font-medium text-sm my-6">Account Security</h2>
            <div class="flex gap-4 justify-between items-center">
                <div>
                    <div class="text-sm">Password</div>
                    <p class="text-xs text-base-content/50">Change your account password to avoid unauthorized access</p>
                </div>
                <a href="/courier/settings/profile?index=1" class="btn btn-md btn-circle btn-primary bg-primary/5 border-none text-primary">
                    <UilLock size="20" />
                </a>
            </div>
        </div>
    </div>

    <div class="w-full mt-4">
        <button class="btn btn-primary bg-error/5 text-error w-full border-none" on:click={logout}>
            <span><UilSignOutAlt /></span>
            Logout
        </button>
    </div>
    <div class="h-16" />
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