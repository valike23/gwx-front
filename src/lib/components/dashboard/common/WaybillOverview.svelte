<script>
    import { goto } from "$app/navigation";
    import { axiosFetch } from "$lib/client/api";
    import dayjs from "dayjs";
    import { onMount } from "svelte";
    import { UilAngleRight } from "svelte-unicons";

    export let allLink = "/admin/waybills/applications/";

    let items = [];

    onMount(() => {
        
        axiosFetch.get("/packages?status=new&limit=5")
            .then(res => {
                items = res.data.data;;
              
            }).catch((err)=>{
                console.log("the error here is", err)
            })
    })

    function viewItem(id) {
        goto(`${allLink}/${id}`)
    }
</script>

<div class="bg-base-100 pt-4 rounded-lg shadow-sm">
    <div class="mb-3 flex justify-between px-4">
        <h3 class="font-medium text-sm pl-4">New Waybills</h3>
        <a href="{allLink}" class="text-primary text-sm">See all</a>
    </div>
    <div class="w-full overflow-x-auto">
        <div class="table custom table-sm">
            <thead>
                <tr>
                    <th class="w-11">ID</th>
                    <th>Item</th>
                    <th class="w-[100px]">Qty</th>
                    <th class="w-[150px]">Date Created</th>
                    <td class="w-[40px]"></td>
                </tr>
            </thead>

            <tbody>
                {#each items as item (item.id) }
                <tr class="hover !text-xs">
                    <td>
                        <span>{item.waybill_number}</span>
                    </td>
                    <td>
                        {#if item.recipient}
                        <span>{ item.recipient.name || "Item" }</span>
                        {/if}
                      
                    </td>
                    <td>
                        <span>{ item.quantity || 1 }</span>
                    </td>
                    <td>
                        <span>{ dayjs(item.created_at).format("DD-MM-YYYY")}</span>
                    </td>
                    <td>
                        <button class="btn btn-circle btn-primary bg-primary/5 btn-xs border-none text-primary hover:text-base-100" on:click={() => viewItem(item.id)}>
                            <UilAngleRight size="18" />
                        </button>
                    </td>
                </tr>
                {/each}
            </tbody>
        </div>
    </div>
</div>