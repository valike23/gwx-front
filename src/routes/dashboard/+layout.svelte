<script>
    import Sidebar from "$lib/components/dashboard/Sidebar.svelte";
    import Header from "$lib/components/dashboard/Header.svelte";

</script>
<main class="w-screen h-screen flex overflow-hidden">
    <Sidebar class="flex-none hidden lg:block w-64 h-screen" />
    <section class="flex-1 dashboard overflow-y-scroll bg-sbg">
        <Header class="z-10" />
        <slot />
    </section>
</main>