<script>
    import { clientFetch } from "$lib/client/api";
    import { onMount } from "svelte";

    let items = [];
    let isLoading = false;

    onMount(() => {
        getData();
    });
    
    function getData() {
        isLoading = true;
        clientFetch({
            path: "/hubs?top=true&limit=5"
        }).then(res => res.json())
        .then(json => {
            items = json.data;
        })
        .finally(() => (isLoading = false));
    }
    
</script>

<div class="bg-base-100 pt-4 rounded-lg shadow-sm">
    <div class="mb-3 flex justify-between px-4">
        <h3 class="font-medium text-sm pl-4">Top Engaging Terminals</h3>
        <a href="/admin/terminals" class="text-primary text-sm">See all</a>
    </div>
    <div class="w-full overflow-x-auto">
        <div class="table custom table-sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Shipments</th>
                    <th>Delivered</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
                {#each items as item (item.id) }
                <tr class="hover !text-xs">
                    <td>
                        <span>{ item.name }</span>
                    </td>
                    <td>
                        <span>{ item.total_shipments }</span>
                    </td>
                    <td>
                        <span>{ item.total_deliveries }</span>
                    </td>
                    <td>
                        <a href="/admin/terminals/{item.id}" class="bg-primary/5 text-primary rounded-lg px-2 py-1 text-2xs">View</a>
                    </td>
                </tr>
                {/each}
            </tbody>
        </div>
    </div>
</div>