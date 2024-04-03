<script>
    import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { PaginationNav } from "svelte-paginate";
    import { UilAngleDown } from "svelte-unicons";

    export let currentPage = 1;
    export let limit = 1;
    export let pageSize = 10;
    export let totalItems = 0;

    let numOptions = [10, 20, 50, 100]

    const dispatch = createEventDispatcher();
</script>

<div 
    class="flex items-center gwx-paginator w-full {$$props.class}"
    class:hidden={!totalItems}>
    <div class="flex-1">
        <span class="text-sm">
            Total: {totalItems}
        </span>
    </div>
    <div class="mr-2">
        <Button
            color="light"
            size="xs"
            class="p-1 px-2 bg-slate-50 text-base-content/60">
            {pageSize}
            <span><UilAngleDown /></span>
        </Button>
        <Dropdown>
            {#each numOptions as i }
              <DropdownItem
                class="{i == pageSize ? 'bg-slate-50' : ''}"
                on:click={() => {
                    if (i != pageSize) {
                        dispatch('setPageSize', {size: i})
                    }
                }}>
                {i}
              </DropdownItem>  
            {/each}
        </Dropdown>
    </div>
    <PaginationNav
        {currentPage}
        {pageSize}
        {totalItems}
        {limit}
        on:setPage={(e) => (dispatch('setPage', {page: e.detail.page}))}
    />
</div>