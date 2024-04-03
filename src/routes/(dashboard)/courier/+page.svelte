<script>
    import { ListPlaceholder } from 'flowbite-svelte';
    import { UilSearch } from "svelte-unicons";
    import RiderDeliveryItem from "$lib/components/courier/RiderDeliveryItem.svelte";
    import RiderHomeHeader from "$lib/components/courier/RiderHomeHeader.svelte";
    import { onMount } from "svelte";
    import { axiosFetch } from "$lib/client/api";
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import EmptyDelivery from '$lib/components/EmptyDelivery.svelte';

    let items = [];
    let isLoading = false;
    let meta = {
        limit: 10,
        page: 1,
        total: 0,
        search: ""
    }

    onMount(() => {
        getData();
    });

    async function getData() {
        
        isLoading = true;

        let query = new URLSearchParams({
            search: meta.search,
            status: "pending,en-route",
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

<RiderHomeHeader />

<div class="page pb-24">

    <div class="flex justify-between items-center mb-4">
        <span>List of recent deliveires</span>
        <a href="/courier/deliveries" class="btn btn-link no-underline font-normal">View all</a>
    </div>

    <div class="mb-4 relative">
        <SearchBox on:search={onSearch} />
    </div>

    <div class="hidden" class:block={isLoading && !items.length}>
        <ListPlaceholder />
    </div>
    

    <!-- The List of deliveries -->
    <div class="grid gap-y-3">
        {#each items as item (item.id)}
        <RiderDeliveryItem data={item} />
        {/each}
    </div>

    {#if !items.length}
    <div class="flex flex-col items-center justify-center min-h-[400px]">
        <div>
            <EmptyDelivery size="150" />             
        </div>
        <div class="text-center py-4 text-sm text-base-content/70">No deliveries to show</div>
    </div>
    {/if}
</div>
