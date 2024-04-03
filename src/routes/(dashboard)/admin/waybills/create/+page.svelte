<script>
    import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
    import Sender from "$lib/components/dashboard/common/package/Sender.svelte";
    import Recipient from "$lib/components/dashboard/common/package/Recipient.svelte";
    import PackageInfo from "$lib/components/dashboard/common/package/PackageInfo.svelte";
    import Shipment from "$lib/components/dashboard/common/package/Shipment.svelte";
    import PackagePreview from "$lib/components/dashboard/common/package/PackagePreview.svelte";
    import { writable } from "svelte/store";

    let activeIndex = 0; 
    let formData = writable({
        sender: {},
        recipient: {},
        name: "",
        value: "",
        weight: "",
        dimensions: {},
        quantity: 1,
        customer_id: "",
        waybill_number: "",
        billing: {
            amount: "0.00",
            extra: "0.00",
            discount: "0.00",
            vat: "0.00"
        }
    });
    const tabs = [
        {
            index: 0,
            title: "Sender",
            view: Sender
        },
        {
            index: 1,
            title: "Recipient",
            view: Recipient
        },
        {
            index: 2,
            title: "Package Info",
            view: PackageInfo
        },
        {
            index: 3,
            title: "Shipment",
            view: Shipment
        },
        {
            index: 4,
            title: "Preview",
            view: PackagePreview
        }
    ];

    function onIndexChanged(e) {
        activeIndex = e.detail;
    }

</script>
<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/waybills">Waybills</BreadcrumbItem>
        <BreadcrumbItem>New Waybill</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div>
    </div>

    <div class="text-sm breadcrumbs mt-4 bg-base-100 shadow-sm px-3 rounded-lg">
        <ul>
            {#each tabs as tab (tab.index)}
            <li class="flex gap-x-3 items-center">
                <span 
                        class="flex-none grid place-content-center w-4 h-4 bg-base-200 rounded-full text-[8px] text-base-content/60 transition-all"
                        class:bg-primary={activeIndex == tab.index}
                        class:text-primary-content={activeIndex == tab.index}
                    >
                        { tab.index + 1 }
                </span>
                <button 
                    class=""
                    class:text-primary={activeIndex == tab.index}
                    class:font-medium={activeIndex == tab.index}
                    class:btn-disabled={activeIndex < (tabs.length - 1)}
                    on:click={() => (activeIndex = tab.index)}
                >
                    <span></span>
                    { tab.title }
            </button>
            </li>   
            {/each}
        </ul>
    </div>

    <div class="bg-base-100 shadow-sm rounded-md p-8 max-w-3xl">
        <svelte:component 
            this={tabs[activeIndex].view} 
            formData={formData} on:index={onIndexChanged} />
    </div>
</div>