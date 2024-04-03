<script>
    import { ListPlaceholder } from 'flowbite-svelte';
    import RiderDeliveryItem from "$lib/components/courier/RiderDeliveryItem.svelte";
    import { UilSearch } from "svelte-unicons";
    import { onMount } from "svelte";
    import { axiosFetch } from "$lib/client/api";
    import EmptyDelivery from '$lib/components/EmptyDelivery.svelte';
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';

    let items = [];
    let isLoading = false;
    let meta = {
        limit: 10,
        page: 1,
        search: ""
    }

    onMount(() => {
        getData();
    });

    async function getData() {
        
        isLoading = true;

        let query = new URLSearchParams({
            search: meta.search,
            status: "completed,canceled",
            limit: meta.limit,
            page: meta.page
        });

        try {
            const res = await axiosFetch.get("/deliveries?" + query.toString())
            items = res.data.data;
            meta = Object.assign(meta, res.data.meta);
        } catch (error) {
            
        } finally {
            isLoading = false;
        }
    }

    function onSearch(e) {
        meta.search = e.detail;
        meta.page = 1;
        getData();
    }
</script>

<div class="h-14 shadow-sm bg-base-100 sticky top-0 wi-full flex items-center justify-between px-8 z-10">
    <h2 class="text-primary font-medium">
        Delivery History
    </h2>

</div>

<div class="page pb-24">

    <div class="mb-4 relative">
        <SearchBox on:search={onSearch} />
    </div>

    <div class="hidden" class:block={isLoading && !items.length}>
        <ListPlaceholder />
    </div>

    <!-- The List of deliveries -->
    <div class="grid gap-y-3">
        {#each items as item (item.id)}
        <RiderDeliveryItem  data={item} showStatus={true} />
        {/each}
    </div>

    {#if !items.length}
    <div class="flex flex-col items-center justify-center min-h-[400px]">
        <div>
            <EmptyDelivery size="150" />             
        </div>
        <div class="text-center py-4 text-sm text-base-content/70">No deliveires to show</div>
    </div>
    {/if}
</div>