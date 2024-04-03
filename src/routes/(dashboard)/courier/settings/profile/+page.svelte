<script>
    import {
        Tab,
        TabGroup,
        TabList,
        TabPanel,
        TabPanels,
    } from "@rgossiaux/svelte-headlessui";
    import Profile from "$lib/components/dashboard/common/settings/Profile.svelte";
    import Security from "$lib/components/dashboard/common/settings/Security.svelte";
    import { UilAngleLeft } from "svelte-unicons";
    import { page } from "$app/stores";


    const views = [
        {key: "profile", name: "Profile", view: Profile},
        {key: "security", name: "Security", view: Security},
    ]; 

    let activeIndex = Number($page.url.searchParams.get("index") || "0"); 

</script>

<div class="h-14 shadow-sm bg-base-100 sticky top-0 w-full flex items-center gap-x-4 px-4 z-10">
    <button href="/courier" class="btn btn-circle btn-sm" on:click={() => (window.history.back())}>
        <UilAngleLeft size="20" />
    </button>
    <h3 class="text-primary font-medium">Settings</h3>
</div>

<div class="page">
    <div class="mx-auto max-w-2xl">
        <TabGroup defaultIndex={activeIndex} on:change={(e) => (activeIndex = e.detail)}>
            <TabList class="">
            {#each views as v, index}
                <Tab 
                    class={({selected}) => `px-6 py-2 rounded-tl-md rounded-tr-md transition-all ${selected ? 'bg-base-100 text-primary font-medium' : 'bg-slate-50'}`}
                >
                    { v.name }
                </Tab>
            {/each  }
            </TabList>
            <TabPanels class="pt-0">
            {#each views as v}
                <TabPanel class="bg-base-100 shadow-sm p-6">
                    <svelte:component this={v.view} />
                </TabPanel>
            {/each}
            </TabPanels>
        </TabGroup>
    </div>
</div>