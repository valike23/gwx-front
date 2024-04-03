<script>
    import { page } from "$app/stores";
    import WaybillInfoCard from "$lib/components/dashboard/common/package/WaybillInfoCard.svelte";
    import { formatCurrency } from "$lib/utils/helpers";
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import { UilParcel } from "svelte-unicons";

    let item = $page.data.waybill; 

    function statusStyle(val) {
        switch (val) {
            case "new": 
            case "queued": return "bg-slate-200";
            case "pending": return "bg-secondary/5";
            case "processing": return "bg-info/5 text-info";
            case "in-transit": return "bg-warning/5";
            case "out-for-delivery": return "bg-accent/10 text-accent";
            case "delivered": return "bg-success text-base-100";
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }

</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/customer" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/customer/waybills">Waybills</BreadcrumbItem>
        <BreadcrumbItem>Waybill Details</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="grid sm:grid-cols-2 max-w-xl gap-8 mb-8">
        <WaybillInfoCard item={item} />
    </div>

    <div class="bg-base-100 shadow-sm rounded-sm p-8">
        <div class="flex-none grid place-content-center bg-accent/5 rounded-full w-11 h-11">
            <UilParcel size="20"/>
        </div>
        <h3 class="font-medium pb-6 uppercase mt-4">Package Details</h3>

        <div class="grid mb-8">
            <div class="info-item">
                <span class="title">Description</span>
                <div class="content">
                    <span class:fade={!item.name} >{ item.name || "Not set" }</span>
                </div>
            </div>
            <div class="info-item">
                <span class="title">Value</span>
                <div class="content">
                    <span class:fade={!item.value} >{ item.value || "Not set" }</span>
                </div>
            </div>
            <div class="info-item">
                <span class="title">Weight (KG)</span>
                <div class="content">
                    <span class:fade={!item.weight} >{ item.weight || "Not set" }</span>
                </div>
            </div>
            <div class="info-item">
                <span class="title">Dimensions</span>
                <div class="content">
                    <div class="flex gap-x-2">
                        <span>{ item.dimensions?.width || "0" }W</span>
                        <span>{ item.dimensions?.height || "0" }H</span>
                        <span>{ item.dimensions?.length || "0" }L</span>
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
                        <span class:fade={!item.sender.name} >{ item.sender.name || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Email</span>
                    <div class="content">
                        <span class:fade={!item.sender.email} >{ item.sender.email || "Not set" }</span>
                    </div>
                </div>
                
                <div class="info-item">
                    <span class="title">Phone</span>
                    <div class="content">
                        <span class:fade={!item.sender.phone} >{ item.sender.phone || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Address</span>
                    <div class="content">
                        <span class:fade={!item.sender.address} >{ item.sender.address || "Not set" }</span>
                    </div>
                </div>
            </div>
            <div class="py-5">
                <h3 class="mb-4 uppercase font-medium">Recipient</h3>
                <div class="info-item">
                    <span class="title">Name</span>
                    <div class="content">
                        <span class:fade={!item.recipient.name} >{ item.recipient.name || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Email</span>
                    <div class="content">
                        <span class:fade={!item.recipient.email} >{ item.recipient.email || "Not set" }</span>
                    </div>
                </div>
                
                <div class="info-item">
                    <span class="title">Phone</span>
                    <div class="content">
                        <span class:fade={!item.recipient.phone} >{ item.recipient.phone || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Address</span>
                    <div class="content">
                        <span class:fade={!item.recipient.address} >{ item.recipient.address || "Not set" }</span>
                    </div>
                </div>
            </div>
            <div class="py-5" class:hidden={!item.billing}>
                <h3 class="mb-4 uppercase font-medium">Billing</h3>
                <div class="info-item">
                    <span class="title">Subtotal</span>
                    <div class="content">
                        <span>{ formatCurrency(item.billing?.subtotal) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Total</span>
                    <div class="content">
                        <span>{ formatCurrency(item.billing?.total) }</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
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