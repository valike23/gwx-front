<script>
    import { getJSON } from '$lib/utils/helpers';
    import dayjs from 'dayjs';
    import { UilParcel } from 'svelte-unicons';

    export let items = [];

</script>

<div class="overflow-hidden" {...$$restProps}>
    {#each items as data }
    <div class="text-sm bg-base-100 flex flex-col p-8 relative" style="width:8.3in;height:11.6in;break-after: always;">
        <div class="flex justify-between items-center">
            <div class="flex-none">
                <img src="/images/logo.png" alt="GWX logo" class="w-full object-cover"/>
            </div>
            <div class="flex space-x-2">
                <div class="text-xs leading-[1.2]">
                    <div>Great Washinton Digital Ltd.</div>
                    <div>Contact: +234-704-292-9292</div>
                    <div>45, Opebi Road, Ikeja, Nigeria.</div>
                    <div>info@greaterwashingtonng.com</div>
                </div>
            </div>
        </div>
        
        <div class="p-8">
            <div class="flex-none grid place-content-center bg-accent/5 rounded-full w-11 h-11">
                <UilParcel size="20"/>
            </div>
            <h3 class="font-medium pb-6 uppercase mt-4">Package Details</h3>
            <div class="grid grid-cols-2 mb-8">
                <div>
                    <div class="info-item">
                        <span class="title">Waybill Number</span>
                        <div class="content">
                            <span>{ data.package.waybill_number }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Date created</span>
                        <div class="content">
                            <span>{ dayjs(data.package.created_at).format("DD-MM-YYYY")}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Name</span>
                        <div class="content">
                            <span class:fade={!data.package.name} >{ data.package.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Description</span>
                        <div class="content">
                            <span class:fade={!data.package.description} >{ data.package.description || "Not set" }</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="info-item">
                        <span class="title">Value</span>
                        <div class="content">
                            <span class:fade={!data.package.value} >{ data.package.value || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Weight (KG)</span>
                        <div class="content">
                            <span class:fade={!data.package.weight} >{ data.package.weight || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Dimensions</span>
                        <div class="content">
                            <div class="flex gap-x-2">
                                <span>{ data.package.dimensions?.width || "0" }W</span>
                                <span>{ data.package.dimensions?.height || "0" }H</span>
                                <span>{ data.package.dimensions?.length || "0" }L</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="grid gap-8 md:grid-cols-2">
                <div class="py-5">
                    <h3 class="mb-4 uppercase font-medium">Sender</h3>
                    <div class="info-item">
                        <span class="title">Name</span>
                        <div class="content">
                            <span class:fade={!data.package.sender.name} >{ data.package.sender.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Email</span>
                        <div class="content">
                            <span class:fade={!data.package.sender.email} >{ data.package.sender.email || "Not set" }</span>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="title">Phone</span>
                        <div class="content">
                            <span class:fade={!data.package.sender.phone} >{ data.package.sender.phone || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Address</span>
                        <div class="content">
                            <span class:fade={!data.package.sender.address} >{ data.package.sender.address || "Not set" }</span>
                        </div>
                    </div>
                </div>
                <div class="py-5">
                    <h3 class="mb-4 uppercase font-medium">Recipient</h3>
                    <div class="info-item">
                        <span class="title">Name</span>
                        <div class="content">
                            <span class:fade={!data.package.recipient.name} >{ data.package.recipient.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Email</span>
                        <div class="content">
                            <span class:fade={!data.package.recipient.email} >{ data.package.recipient.email || "Not set" }</span>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="title">Phone</span>
                        <div class="content">
                            <span class:fade={!data.package.recipient.phone} >{ data.package.recipient.phone || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Address</span>
                        <div class="content">
                            <span class:fade={!data.package.recipient.address} >{ data.package.recipient.address || "Not set" }</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-4">
                <h3 class="my-4 uppercase font-medium">Proof of Delivery</h3>
            </div>
            <div class="grid grid-cols-3">
                <div class="col-span-2">
                    <div>
                        <div class="info-item">
                            <span class="title">Time Created</span>
                            <div class="content">
                                <span>{ dayjs(data.created_at).format("DD-MM-YYYY HH:mm A") }</span>
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Delivery Time</span>
                        <div class="content">
                            <span>{ dayjs(data.completed_at || data.updated_at).format("DD-MM-YYYY HH:mm A") }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Origin Hub</span>
                        <div class="content">
                            <span>{ getJSON(data.hub)?.name }</span>
                        </div>
                    </div>
                    <div class="info-item" style="display:{data.consignee ? 'flex' : 'none'};">
                        <span class="title">Consignee</span>
                        <div class="content">
                            <span>{ data.consignee }</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-xs uppercase text-base-content/60">Recipient Signature</div>
                    <img src="{data.signature}" alt="Signature" />
                </div>
            </div>
        </div>

        <div class="py-4 px-8 flex justify-between text-xs absolute bottom-0 right-0 left-0">
            <span>www.greaterwashington.com</span>
            <span>Printed on { dayjs().format("DD/MM/YYYY hh:mm A") }</span>
        </div>
    </div>
    {/each}
</div>

<style lang="postcss" scoped>
    .info-item {
        @apply flex py-2 border-b border-b-slate-50;
    }
    .info-item .title {
        @apply flex-none w-28 sm:w-20 md:w-28 text-xs uppercase text-base-content/60 pt-1;
    }
    .info-item .content {
        @apply text-sm flex flex-col items-start text-base-content/75 gap-y-2;
    }
    .info-item .content .fade {
        @apply text-base-content/40 italic;
    }
</style>