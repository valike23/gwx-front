<script>
    import dayjs from 'dayjs';
    import Barcode from 'svelte-barcode';

    export let items = [];

</script>

<div class="overflow-hidden" {...$$restProps}>
    {#each items as item }
    <div class="text-sm bg-base-100 flex flex-col px-8 py-4 justify-around" style="width:8.3in;break-after: always;">
        <div class="flex justify-between items-center my-5">
            <div class="flex space-x-2">
                <div class="flex-none w-[90px]">
                    <img src="/images/logo.png" alt="GWX logo" class="w-full object-cover"/>
                </div>
                <div class="text-xs leading-[1.0]">
                    <div>Great Washinton Digital Ltd.</div>
                    <div>Contact: +234-704-292-9292</div>
                    <div>45, Opebi Road, Ikeja, Nigeria.</div>
                    <div>info@greaterwashingtonng.com</div>
                </div>
            </div>
            <div class="scale-100">
                <Barcode
                    value={item.id}
                    elementTag='svg'
                    options={{
                        format: 'CODE128',
                        width: 2,
                        height: 70,
                        text: '',
                        textAlign: 'center',
                        textPosition: 'bottom',
                        textMargin: 2,
                        fontSize: 16,
                        background: '#ffffff',
                        lineColor: '#000000',
                    }}
                />
            </div>
        </div>
        <div class="my-6 flex gap-3 divide-x border">
            <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
                <span class="font-medium">ORIGIN:</span>
                <span>{ item.origin.name }</span>
            </div>
            <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
                <span class="text-xs font-medium">DESTINATION:</span>
                <span>{ item.destination.name }</span>
            </div>
            <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
                <span class="text-xs font-medium">DATE:</span>
                <span>{ dayjs(item.created_at).format("DD/MM/YYYY hh:mm A") }</span>
            </div>
        </div>
        <div class="font-semibold py-3 px-4">Waybills</div>
        <table class="table table-xs custom border">
            <thead>
                <tr>
                    <th class="w-16">S/N</th>
                    <th>Manifest ID</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Weight</th>
                </tr>
            </thead>
            <tbody>
            {#each item.packages as pkg, index }
                <tr>
                    <td>{ index + 1 }</td>
                    <td>
                        <span>{ pkg.waybill_number }</span>
                    </td>
                    <td>
                        <span>{ pkg.name }</span>
                    </td>
                    <td>
                        <span>{ pkg.quantity || 1 }</span>
                    </td>
                    <td>
                        <span>{pkg.weight || 0.0} KG</span>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
        <div class="py-8 flex justify-between text-xs">
            <span class="uppercase font-semibold">{""}</span>
            <span>www.greaterwashington.com</span>
            <span>Printed on { dayjs().format("DD/MM/YYYY hh:mm A") }</span>
        </div>
    </div>
    {/each}
</div>