<script>
    import dayjs from 'dayjs';
    import Barcode from 'svelte-barcode';

    export let items = [];

    console.log("see the different items", items);
</script>

<div class="overflow-hidden flex flex-col items-center justify-center" {...$$restProps}>
    {#each items as item }
    <div class="text-sm bg-base-100 flex flex-col p-8 justify-around" style="width:8.3in;height:11.6in;break-after: always;">
        {#each Array(2) as _, index}
        <div class="flex-none p-8 border flex flex-col justify-center item-stretch border-black" style="height:{(11.7 / 2) - 1.1}in;">
            <div class="grid grid-cols-3 items-center gap-4">
                <div class="flex space-x-2">
                    <div class="flex-none w-[80px]">
                        <img src="/images/logo.png" alt="GWX logo" class="w-full object-cover"/>
                    </div>
                    <div class="text-[11px] leading-[1.0]">
                        <div>Great Washinton Digital Ltd.</div>
                        <div>Contact: +234-704-292-9292</div>
                        <div>45, Opebi Road, Ikeja, Nigeria.</div>
                        <div>info@greaterwashingtonng.com</div>
                    </div>
                </div>
                <div class="scale-50">
                    <h1 class="barcode">{item.waybill_number}</h1>
                </div>
                <div>
                    <div class="divide-y divide-black/75 border border-black/70 mb-3">
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th class="w-[40px]"></th>
                                    <th class="w-[100px]"></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody class="uppercase text-xs font-medium">
                                <tr>
                                    <td>Origin</td>
                                    <td> </td>
                                    <td>Destination</td>
                                    <td> </td>
                                </tr>
                                <tr>
                                    <td>QTY</td>
                                    <td> </td>
                                    <td>Weight</td>
                                    <td> </td>
                                </tr>
                                
                            </tbody>
                        </table>
                    </div>
                    <div class="text-xs text-right">Time Raised: { dayjs(item.created_at).format("DD/MM/YYYY hh:mm A") }</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 flex-1 -mt-8">
                <div>
                    <div class="divide-y divide-black/30">
                        <div class="item">
                            <div>
                                <span class="title">Sender's name:</span>
                                <span>{ item.sender.name }</span>
                            </div>
                        </div>
                        <div class="item">
                            <div>
                                <span class="title">Address:</span>
                                <span>{ item.sender.address }</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="grid grid-cols-2">
                                <div>
                                    <span class="title">Tel:</span>
                                    <span>{ [item.sender.phone, item.sender.alternate_phone].filter(e => !!e).join(", ") }</span>
                                </div>
                                <div>
                                    <span class="title">Email:</span>
                                    <span>{ item.sender.email || "" }</span>
                                </div>
                            </div>
                            
                        </div>
                        <div class="item">
                            <div class="grid grid-cols-2">
                                <div>
                                    <span class="title">Description:</span>
                                </div>
                                <div>
                                    <span class="title">Sender's signature:</span>
                                </div>
                            </div>
                            <div class="h-11"/>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="divide-y divide-black/30">
                        <div class="item">
                            <div>
                                <span class="title">Consignee's name:</span>
                                <span>{ item.recipient.name }</span>
                            </div>
                        </div>
                        <div class="item">
                            <div>
                                <span class="title">Address:</span>
                                <span>{ item.recipient.address }</span>
                            </div>
                        </div>
                        <div class="item">
                            <div class="grid grid-cols-2">
                                <div>
                                    <span class="title">Tel:</span>
                                    <span>{ [item.recipient.phone, item.recipient.alternate_phone].filter(e => !!e).join(", ") }</span>
                                </div>
                                <div>
                                    <span class="title">Email:</span>
                                    <span>{ item.recipient.email || "" }</span>
                                </div>
                            </div>
                            
                        </div>
                        <div class="item">
                            <div class="grid grid-cols-2">
                                <div>
                                    <span class="title">Received by:</span>
                                    <div class="flex flex-col">
                                        <span class="h-6">Name:</span>
                                        <span>Time & Date:</span>
                                        <span>Signature:</span>
                                    </div>
                                </div>
                                <div>
                                    <span class="title">courier info:</span>
                                    <div class="flex flex-col">
                                        <span class="h-6">Name:</span>
                                        <span>Time & Date:</span>
                                        <span>Route:</span>
                                        <span>Signature:</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-8 flex justify-between">
                <span class="uppercase font-semibold">{index == 0 ? "Sender's copy" : "Origin's copy"}</span>
                <span>www.greaterwashington.com</span>
                <span>Printed on { dayjs().format("DD/MM/YYYY hh:mm A") }</span>
            </div>
            
        </div>
        {/each}
    </div>
    {/each}
</div>

<style lang="postcss">
     .barcode {
        font-family: 'Libre Barcode 128';font-size: 50px; width: 2;height: 80,
    }
.item {
    @apply py-3 px-4 text-2xs;
}
.item .title {
    @apply font-semibold uppercase text-2xs;
}
td {
    @apply px-1 py-1 border-b;
}
@media print {
        @page {
            margin: 0;
            transform: scale(0.60);
            break-after: always;
        }
    }
</style>