<script>
    import { formatPhoneNumber } from '$lib/client/helpers';
    import { getJSON, truncate } from '$lib/utils/helpers';
    import dayjs from 'dayjs';

    export let node; 
    console.log("the node log", node);
    export let items = [];
    console.log("thermal printer logs", items);
</script>

<div bind:this={node} class="overflow-hidden bg-[#f8f8f8] flex flex-col items-center justify-center" {...$$restProps}>
    {#each items as item }
    <div class="text-sm bg-base-100 flex flex-col p-4 divide-y divide-dashed mb-16 mt-4" style="width:9cm;height:13.5cm;">
        <div class="flex w-full pb-0">
            <div class="w-[50px]">
                <img src="/images/logo.png" alt="GWX logo" class="w-full object-cover"/>
            </div>
            <div class="flex-1"/>
            <div class="text-xs space-y-0.5">
                <div>
                    <span>DOS: </span>
                    <span class="font-semibold">{dayjs(item.created_at).format("DD/MM/YYYY hh:mm A")}</span>
                </div>
                <div>
                    <span>Waybill: </span>
                    <span class="font-semibold">{item.waybill_number}</span>
                </div>
                <div>
                    <span>Hub: </span>
                    {#if item.delivery}
                    <span class="font-semibold uppercase">{getJSON(item.delivery?.hub)?.name}</span>
                    {/if}
                </div>
            </div>
        </div>

        <div class="flex-1 grid grid-cols-2 gap-1 text-xs py-1 mt-5">
            <div class="space-y-0.5">
                <div>
                    <span>FROM: </span>
                    <span class="font-semibold uppercase">Name: {item.sender.name }</span>
                </div>
                <div class="font-semibold uppercase">Address: { item.sender.address || "" }</div>
            </div>
            <div class="space-y-0.5 text-right">
                <div>
                    <span>TO: </span>
                    <span class="font-semibold uppercase">Name: {item.recipient.name }</span>
                </div>
                <div class="font-semibold uppercase">Phone:{formatPhoneNumber(item.recipient.phone) }</div>
                <div class="font-semibold uppercase">Address:{ item.recipient.address || ""}</div>
            </div>
        </div>

        <!-- Spacer div to push the last item to the bottom -->
        <div class="flex-1"></div>
        <div class="flex-1"></div>
        <div class="flex-1"></div>
        <div class="flex-1"></div>
        <div class="flex-1"></div>
        <div class="flex-1"></div>
        <div class="mt-5"></div>
        <div class="py-0">
            <table class="table border-separate text-xs">
                <thead>
                    <tr class="uppercase">
                        <th>Description</th>
                        <th>Origin</th>
                        <th>Weight</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{truncate(item.description || "", 15)}</td>
                        <td>
                            {#if item.delivery}
                            {getJSON(item.delivery.hub).code}
                            {/if}
                        </td>
                        <td>{ item.weight } KG</td>
                        <td>{ item.quantity || 1 }</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Last item, pushed to the bottom of the page -->
        <div class="mt-auto">
            <div class="flex pt-0 items-center justify-center">
                <div>
                    <h1 class="barcode">{item.waybill_number}</h1>
                </div>
            </div>
        </div>
    </div>
    {/each}
</div>

<style>
    .barcode {
        font-family: 'Libre Barcode 128';
        font-size: 45px;
        height: 70px;
    }
</style>
