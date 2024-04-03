<script>
    import {
        Dialog,
        DialogOverlay,
        Transition,
        TransitionChild
    } from "@rgossiaux/svelte-headlessui";
    import { UilBars } from "svelte-unicons";

    import Sidebar from "$lib/components/dashboard/Sidebar.svelte";
    import Quicklink from "./Quicklink.svelte";

    let isOpen = false;
</script>

<header class="shadow-sm z-10 bg-base-100 sticky top-0 w-full h-16 lg:hidden">
    <nav class="h-full w-screen flex justify-center items-center px-4 relative">
        <button class="absolute left-1 btn btn-ghost top-2" on:click={() => (isOpen = true)}>
            <UilBars size="25" />
        </button>
        <Quicklink class="absolute right-6" />
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