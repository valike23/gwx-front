<script>
    import {
        Dialog,
        DialogOverlay,
        Transition,
        TransitionChild
    } from "@rgossiaux/svelte-headlessui";

    import Sidebar from "$lib/components/dashboard/customer/Sidebar.customer.svelte";
    import { getInitials } from "$lib/utils/helpers";
    import { page } from "$app/stores";
    import { UilPower } from "svelte-unicons";

    let user = $page.data.session.user;

    let isOpen = false;

    function logout() {
        const res = confirm("Are you sure you want to logout? All unsaved changes will be lost.")
        if (res) {
            const uri = $page.url
            uri.pathname = "/auth/signout";
            window.location.href = uri.toString();
        }
    }
</script>

<header class="shadow-sm z-10 bg-base-100 sticky top-0 w-full h-16 md:hidden">
    <nav class="h-full w-screen flex justify-center items-center px-4 relative">
        <div class="">
            <img src="/images/logo.png" alt="GEX Logo" class="w-[90px]"/>
        </div>
        <div class="flex-1"/>
        <div class="flex items-center gap-x-3 flex-row-reverse">
            <a  href="/customer/settings" class="avatar placeholder">
                <div class="w-9 h-9 rounded-full bg-slate-100">
                    <span class="font-medium text-sm">{ getInitials(user.name) }</span>
                </div>
            </a>
            <button class="md:hidden grid place-content-center bg-error/10 rounded-full w-7 h-7 text-error" on:click={logout}>
                <UilPower size="15"/>
            </button>
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