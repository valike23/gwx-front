<script>
    import { page } from "$app/stores";
    import DeliveryPrint from "$lib/components/dashboard/DeliveryPrint.svelte";
    import { getJSON } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import { UilParcel, UilPrint, UilUser } from "svelte-unicons";

    const data = $page.data.data;
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/deliveries">Deliveries</BreadcrumbItem>
        <BreadcrumbItem>Delivery Details</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page print:hidden">
    <div class="flex justify-end items-center my-4">
        <button 
            class="btn btn-outline btn-primary btn-circle btn-sm" 
            class:hidden={data.status !== "completed"}
            on:click={() => (print())}>
            <UilPrint size="20" />
        </button>
    </div>
    <div class="grid lg:grid-cols-3 gap-4 mb-6">
        <div class="card bg-base-100 rounded-md shadow-sm p-4">
            <h4 class="text-sm">Delivery Details</h4>
            <div class="py-1 mt-2 text-sm">
                <span>ID:</span>
                <span>{ data.id }</span>
            </div>
            <div class="py-1 text-sm">
                <span>OTP:</span>
                <span class="font-semibold">{ data.pin }</span>
            </div>
        </div>
        <div class="card bg-base-100 rounded-md shadow-sm p-4">
            <h3>Courier</h3>
            <div class="flex mt-3 gap-4 text-sm  items-center">
                <!-- <Avatar 
                    src="{courier?.profile_image_url || ""}"
                /> -->
                <div class="grid place-content-center w-14 h-14 bg-slate-50 rounded-full text-base-content/40">
                    <UilUser size="15" />
                </div>
                <div>
                    <div>{ data.courier?.name }</div>
                    <div class="text-gray-500">{ data.courier?.email || "" }</div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="bg-base-100 rounded-sm shadow-sm">
        <div class="p-8">
            <div class="flex-none grid place-content-center bg-accent/5 rounded-full w-11 h-11 mt-8">
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
        </div>
    </div>

    {#if data && data.status == "completed"}
    <div class="bg-base-100 shadow-sm rounded-sm p-8">
        <div>
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
    {/if}
</div>

<DeliveryPrint items={[data]} class="hidden print:block"/>

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