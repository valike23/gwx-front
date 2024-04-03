<script>
    import { goto } from "$app/navigation";
    import { axiosFetch } from "$lib/client/api";
    import { formatK } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { onMount } from "svelte";
    import { UilArchive } from "svelte-unicons";

    let items = [];

    onMount(() => {
        getData();
    });

    function getData() {
        axiosFetch.get("/packages?limit=5")
        .then(res => {
            items = res.data.data;
        })
    }

    function statusStyle(val) {
        switch (val) {
            case "queued": return "bg-slate-50";
            case "pending": return "bg-secondary/5";
            case "processing": return "bg-info/5 text-info";
            case "in-transit": return "bg-warning/5";
            case "out-for-delivery": return "bg-accent/10 text-accent";
            case "delivered": return "bg-success text-base-100";
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-50";
        }
    }
</script>

<div class="bg-base-100 p-6 rounded-sm shadow-sm">
    <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-sm">Waybills</h3>
        <a href="/customer/waybills" class="text-sm text-primary font-medium">
            See all
        </a>
    </div>

    <div class="md:hidden -mx-6">
        {#each items as item (item.id)}
        <div class="flex px-5 py-4 gap-4 bg-base-100 hover:bg-slate-50 cursor-pointer border-b border-b-slate-50 items-center item relative transition-all">
            <div class="flex-none grid place-content-center rounded-full w-10 h-10 text-accent bg-accent/5">
                <UilArchive size="20" />
            </div>
            <div class="flex-1 text-sm flex flex-col gap-y-1">
                <div class="text-sm text-base-content/80 font-medium">
                    #{ item.waybill_number }
                </div>
                <span class="text-xs text-base-content/40">{ dayjs(item.created_at).format('DD/MM/YYYY') }</span>
            </div>
            <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase">
                { item.status }
            </span>
            <button on:click={() => goto("/customer/waybills/" + item.id)}/>
        </div>
        {/each}
    </div>
    

    <div class="w-full overflow-x-auto">
        <table class="hidden md:table custom no-pl table-xs table-auto">
            <thead>
                <tr>
                    <th class="pl-0">Number</th>
                    <th>Item Name</th>
                    <th>Item Value</th>
                    <th>Quantity</th>
                    <th>Delivery Cost</th>
                    <th>Status</th>
                    <th>Date Created</th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id) }
                <tr>
                    <td>
                        <span>{ item.waybill_number }</span>
                    </td>
                    <td>
                        <span>{ item.name }</span>
                    </td>
                    <td>
                        <span>{ item.value }</span>
                    </td>
                    <td>
                        <span>{ item.quantity || 1 }</span>
                    </td>
                    <td>
                        <span>{ item.cost || "Not set" }</span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} uppercase text-2xs px-2 py-1 rounded-md font-medium">{ item.status }</span>
                    </td>
                    <td>
                        <span>{ dayjs(item.created_at).format("DD-MM-YYYY") }</span>
                    </td>
                    <td>
                        <a href="/customer/waybills/{item.id}" class="px-2 py-1 rounded-md text-2xs uppercase bg-accent/5 text-accent font-medium">
                            View
                        </a>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    
</div>
<style lang="postcss" scoped>
.item:hover button {
    @apply absolute left-0 right-0 top-0 bottom-0;
}
</style>