<script>
    import { page } from "$app/stores";
    import { UilBell } from "svelte-unicons";
    import MobileNavbar from "./MobileNavbar.svelte";
    import Quicklink from "./Quicklink.svelte";

    $: user = $page.data.session.user;

</script>

<MobileNavbar />

<header class="{`h-16 bg-base-100 sticky top-0 shadow-sm hidden lg:block ${$$props.class}`}">
    <nav class="w-full h-full flex px-4 items-center gap-x-4">
        <div class="flex flex-col">
            <span class="text-xs text-base-content/30">Welcome Back</span>
            <span class="text-sm"> <strong>{ user.name }</strong></span>
        </div>
        <div class="flex-1" />
        <button class="btn btn-ghost btn-circle">
            <span class="text-base-content/70"><UilBell size="22" /></span>
        </button>
        <Quicklink />
    </nav>
</header>