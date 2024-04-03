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


    const views = [
        {key: "profile", name: "Profile", view: Profile},
        {key: "security", name: "Security", view: Security},
    ]; 

    let activeIndex = 0; 

</script>

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