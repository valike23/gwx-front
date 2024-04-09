<script>
    import dayjs from "dayjs";
    import printJS from "print-js";
    import html2pdf from "html2pdf.js";
    import { sineIn } from 'svelte/easing';
    import Barcode from 'svelte-barcode';
    import { page } from "$app/stores";
    import WaybillInfoCard from "$lib/components/dashboard/common/package/WaybillInfoCard.svelte";
    import { debounce, formatCurrency, getJSON } from "$lib/utils/helpers";
    import { Alert, Breadcrumb, BreadcrumbItem, Button, Drawer, Dropdown, DropdownItem, Indicator, Modal, Spinner, Tooltip } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilEdit, UilEditAlt, UilHistory, UilParcel, UilPrint, UilTicket } from "svelte-unicons";
    import Shipment from "$lib/components/dashboard/common/package/Shipment.svelte";
    import { get, writable } from "svelte/store";
    import { clientFetch } from "$lib/client/api";
    import { failure, success } from "$lib/utils/toast";
    import PackageInfo from "$lib/components/dashboard/common/package/PackageInfo.svelte";
    import Sender from "$lib/components/dashboard/common/package/Sender.svelte";
    import Recipient from "$lib/components/dashboard/common/package/Recipient.svelte";
    import WaybillPrint from "$lib/components/dashboard/WaybillPrint.svelte";
    import WaybillShippingCard from "$lib/components/dashboard/common/package/WaybillShippingCard.svelte";
    import WaybillPrintThermal from "$lib/components/dashboard/WaybillPrintThermal.svelte";
    import { closeModal, showModal } from "$lib/stores/app";
    import { TicketOutline } from "svelte-ionicons";
    import { computeStatus } from "$lib/client/helpers";

    let item = writable($page.data.waybill); 
    let hideBilling = true;
    let hidePackageInfo = true;
    let hideSender = true;
    let hideRecipient = true;
    let isLoading = false;
    let labelLayout, timer;

    let transitionParams = {x: 320, duration: 200, easing: sineIn};
    
    onMount(() => {
        // sanitize data
        item.update(val => {
            // sender state
            if (typeof val.sender?.state == 'string') {
                val.sender.state = {id: val.sender.state};
            }

            if (typeof val.sender?.country == 'string') {
                val.sender.country = {id: val.sender.country};
            }

            return val;
        })
    })

    function statusStyle(val) {
        switch (val) {
            case "in-transit": return "text-secondary";
            case "delivered":
            case "completed": return "text-success";
            case "returned":
            case "canceled": return "text-error";
            default: return "text-text-base-content/80";
        }
    }

    function printWaybill() {
        // let w = window.open();
        // w.document.write(document.getElementById("waybill-print").innerHTML);
        // w.document.close();
        // w.focus();
        // w.print();
        // w.close();

        // print();
        // return;
        // html2pdf(document.getElementById("waybill-print"), {
        //     margin: 0,
        //     filename: `${$item.waybill_number}.pdf`,
        //     image: { type: 'jpeg', quality: 0.98 },
        //     jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        // }).save()

        let layout;

        try {
            layout = document.getElementById("waybill-print")

            // set class to print:block
            if (!layout.classList.contains("print:block")) {
                layout.classList.add("print:block")
            }

            print();
            
        } catch (error) {
            failure(error);
        } finally {
            layout.classList.remove("print:block")
            closeModal();
        }
    }

    async function updateData() {
        isLoading = true;
        const body = get(item);
        delete body.delivery;
        try {
            const res = await clientFetch({
                path: "/packages/" + $item.id,
                method: "PUT",
                body: body
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success("Updated successfully");
            $item = Object.assign($item, json.data);
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

    async function printToThermal() {
        showModal();

        try {

            const el = document.createElement("div");
            el.innerHTML = labelLayout.innerHTML;

            const doc = await html2pdf().from(el).set({
                margin: 0,
                // filename: `${$item.waybill_number}.pdf`,
                image: {type: 'png', quality: 1},
                jsPDF: {unit: 'cm', format: [10, 15], orientation: 'portrait'}
            }).output('bloburi');

            // print the document
            printJS(doc);
            
        } catch (error) {
            console.log(error);
            failure(error);
        } finally {
            closeModal();
        }
    }

    async function editPackage(){
        alert("the world");
        console.log($item);
        try {
            const res = await clientFetch({
                path: `/packages/${$item.id}`,
                method: "PUT",
                body: $item
            })
            const json = await res.json();
            if (!res.ok) throw json;
            success("Package has been updated");

            // reload the page
           // setTimeout(() => ( window.location.reload()), 10000);
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

  

    async function cancelDelivery() {

        const yes = confirm("Do you really want to continue? This action can not be reversed. You can always reassign the delivery.")
        if (!yes) return;

        showModal();
        isLoading = true;
        try {
            const res = await clientFetch({
                path: `/deliveries/${$item.delivery.id}/cancel`,
                method: "POST",
                body: {
                    reason: "Delivery to be returned"
                }
            })
            const json = await res.json();
            if (!res.ok) throw json;
            success("Delivery canceled successfully");

            // reload the page
            setTimeout(() => ( window.location.reload()), 1000);
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

</script>

<svelte:head>
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> -->
</svelte:head>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/waybills">Waybills</BreadcrumbItem>
        <BreadcrumbItem>Waybill Details</BreadcrumbItem>
    </Breadcrumb>
</div>
<div class="page print:hidden">
    <div class="flex items-center justify-between mb-4">
        <div class="flex flex-1 justify-end gap-3 items-center">
            <div>
                <Button 
                    id="history"
                    color="light"
                    size="xs"
                    pill
                    class="bg-slate-100 text-base-content/60"
                    >
                    <UilHistory size="18" />
                </Button>
                <Dropdown
                    triggeredBy="#history"
                    placement="bottom"
                    class="w-72 z-[10]">
                    <div slot="header" class="text-center py-3 font-medium bg-slate-50 text-sm">Delivery History</div>
                    <div class="divide-y relative">
                       {#each $item.history as dl, index }
                        <DropdownItem class="flex gap-3 p-3 items-center">
                            <div class="w-6 h-6 rounded-full grid place-content-center bg-slate-100 text-sm">
                                {index + 1}
                            </div>
                            <div class="flex-1 text-sm">
                                <div>{getJSON(dl.hub).name}</div>
                                <div class="flex justify-between">
                                    <span class="{statusStyle(dl.status)} font-semibold text-xs">{computeStatus(dl.status)}</span>
                                    <a href="/admin/deliveries/{dl.id}" class="text-xs font-medium hover:underline text-primary">See more</a>
                                </div>
                            </div>
                        </DropdownItem>
                       {/each} 
                    </div>
                </Dropdown>
            </div>
            <button 
                id="thermal-print"
                class="btn btn-outline btn-primary btn-circle btn-sm" 
                on:click={() => (debounce(() => printToThermal(), 200, timer))}>
                <TicketOutline size="20" />
            </button>
            <Tooltip triggeredBy="#thermal-print">Print label</Tooltip>
            
            <button 
                class="btn btn-outline btn-primary btn-circle btn-sm" 
                on:click={() => (printWaybill())}>
                <UilPrint size="20" />
            </button>
            <Button 
                size="sm" 
                class="space-x-2" 
                outline 
                on:click={updateData}
                disabled={isLoading}>
                <span class="loading loading-spinner w-3" class:hidden={!isLoading}></span>
                <span>Update</span>
            </Button>
        </div>
    </div>
    
    <div class="grid sm:grid-cols-2 max-w-xl gap-8 mb-8">
        <WaybillInfoCard item={$item} />
        <WaybillShippingCard item={$item} />
    </div>

    {#if $item.delivery && ["en-route", "pending"].includes($item.delivery.status)}
    <Alert color="red">
        <div class="pb-2 text-sm">Would you like to cancel the ongoing delivery?</div>
        <Button
            color="red"
            on:click={cancelDelivery}>
            {#if isLoading}
            <Spinner size={4} class="mr-3" />
            {/if}
            Cancel Delivery
        </Button>
    </Alert>
    {/if}

    <div class="bg-base-100 rounded-sm shadow-sm" >
        <div class="p-8" id="pdf">
            <div class="w-full flex flex-col md:flex-row-reverse justify-between gap-8">
                <div class="flex justify-center md:justify-end">
                    <Barcode
                        value={$item.waybill_number}
                        elementTag='svg'
                        options={{
                            format: 'CODE128',
                            width: 2,
                            height: 100,
                            text: '',
                            textAlign: 'center',
                            textPosition: 'bottom',
                            textMargin: 2,
                            fontSize: 20,
                            background: '#ffffff',
                            lineColor: '#000000',
                        }}
                    />
                </div>
                
                <div>
                    <div class="grid grid-cols-2 gap-4 py-6">
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span class="text-xs text-base-content/50 uppercase">Date created</span>
                            <div class="text-xs text-base-content/80">{ dayjs($item.created_at).format("DD-MM-YYYY [at] HH:mm A")}</div>
                        </div>
                        {#if $item.creator }
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span class="text-xs text-base-content/50 uppercase">Created BY</span>
                            <div class="text-xs text-base-content/80">{ $item.creator.name }</div>
                        </div>
                        {/if}
                    </div>
                </div>
                
            </div>
            <div class="flex-none grid place-content-center bg-accent/5 rounded-full w-11 h-11 mt-8">
                <UilParcel size="20"/>
            </div>
            <div class="flex justify-between items-center">
                <h3 class="my-4 uppercase font-medium">Package Details</h3>
                <Button size="xs" color="alternative" class="p-2 rounded-full bg-primary/5 text-primary space-x-2" on:click={() => (hidePackageInfo = false)}>
                    <span><UilEditAlt size="18"/></span>
                    <span>Edit</span>
                </Button>
            </div>
            <div class="grid mb-8">
                <div class="info-item">
                    <span class="title">Description</span>
                    <div class="content">
                        <span class:fade={!$item.name} >{ $item.name || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Value</span>
                    <div class="content">
                        <span class:fade={!$item.value} >{ $item.value || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Weight (KG)</span>
                    <div class="content">
                        <span class:fade={!$item.weight} >{ $item.weight || "Not set" }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Dimensions</span>
                    <div class="content">
                        <div class="flex gap-x-2">
                            <span>{ $item.dimensions?.width || "0" }W</span>
                            <span>{ $item.dimensions?.height || "0" }H</span>
                            <span>{ $item.dimensions?.length || "0" }L</span>
                        </div>
                    </div>
                </div>
            </div>
    
            <div class="grid gap-8 md:grid-cols-2">
                <div class="py-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="uppercase font-medium">Sender</h3>
                        <Button size="xs" color="alternative" class="p-2 rounded-full bg-primary/5 text-primary space-x-2" on:click={() => (hideSender = false)}>
                            <span><UilEdit size="15"/></span>
                            <span>Edit</span>
                        </Button>
                    </div>
                    <div class="info-item">
                        <span class="title">Name</span>
                        <div class="content">
                            <span class:fade={!$item.sender.name} >{ $item.sender.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Email</span>
                        <div class="content">
                            <span class:fade={!$item.sender.email} >{ $item.sender.email || "Not set" }</span>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="title">Phone</span>
                        <div class="content">
                            <span class:fade={!$item.sender.phone} >{ $item.sender.phone || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Address</span>
                        <div class="content">
                            <span class:fade={!$item.sender.address} >{ $item.sender.address || "Not set" }</span>
                        </div>
                    </div>
                </div>
                <div class="py-5">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="uppercase font-medium">Recipient</h3>
                        <Button size="xs" color="alternative" class="p-2 rounded-full bg-primary/5 text-primary space-x-2" on:click={() => (hideRecipient = false)}>
                            <span><UilEdit size="15"/></span>
                            <span>Edit</span>
                        </Button>
                    </div>
                    <div class="info-item">
                        <span class="title">Name</span>
                        <div class="content">
                            <span class:fade={!$item.recipient.name} >{ $item.recipient.name || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Email</span>
                        <div class="content">
                            <span class:fade={!$item.recipient.email} >{ $item.recipient.email || "Not set" }</span>
                        </div>
                    </div>
                    
                    <div class="info-item">
                        <span class="title">Phone</span>
                        <div class="content">
                            <span class:fade={!$item.recipient.phone} >{ $item.recipient.phone || "Not set" }</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="title">Address</span>
                        <div class="content">
                            <span class:fade={!$item.recipient.address} >{ $item.recipient.address || "Not set" }</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    <div class="bg-base-100 shadow-sm rounded-sm p-8">
        <div class="py-5">
            <div class="flex justify-between items-center">
                <h3 class="mb-4 uppercase font-medium">Billing</h3>
                <Button size="xs" color="alternative" class="p-2 rounded-full bg-primary/5 text-primary" on:click={() => (hideBilling = false)}>
                    <span><UilEditAlt size="18"/></span>
                </Button>
            </div>
            <div class="grid grid-cols-2">
                <div class="info-item">
                    <span class="title">Amount</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.amount) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Extra charges</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.extra) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Subtotal</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.subtotal) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Discount</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.discount) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">VAT</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.subtotal) }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Total</span>
                    <div class="content">
                        <span>{ formatCurrency($item.billing?.total) }</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {#if $item.delivery && $item.delivery.status == "completed"}
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
                            <span>{ dayjs($item.delivery.created_at).format("DD-MM-YYYY HH:mm A") }</span>
                        </div>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Delivery Time</span>
                    <div class="content">
                        <span>{ dayjs($item.delivery.completed_at || $item.delivery.updated_at).format("DD-MM-YYYY HH:mm A") }</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="title">Origin Hub</span>
                    <div class="content">
                        <span>{ getJSON($item.delivery.hub)?.name }</span>
                    </div>
                </div>
            </div>
            <div>
                <div class="text-xs uppercase text-base-content/60">Recipient Signature</div>
                <img src="{$item.delivery.signature}" alt="Signature" />
            </div>
        </div>
    </div>
    {/if}
</div>

<!-- Package info Drawer -->
<Drawer
    bind:hidden={hidePackageInfo}
    transitionType="fly"
    {transitionParams}
    placement="right" 
    width="w-full max-w-[600px]"
>
    <div>
        <div class="flex justify-end">

        </div>
        <PackageInfo 
            formData={item}
            showBackButton={true}
            on:index={(e) => {
               
                hidePackageInfo = true;
                editPackage();
                if (e.detail == 1) return;
            }}
        />
    </div>
</Drawer>

<!-- Sender Drawer -->
<Drawer
    bind:hidden={hideSender}
    transitionType="fly"
    {transitionParams}
    placement="right" 
    width="w-full max-w-[600px]"
>
    <div>
        <div class="flex justify-end">

        </div>
        <Sender 
            formData={item}
            showBackButton={true}
            on:index={(e) => {
                hideSender = true;
                editPackage();
                if (e.detail == 1) return;
            }}
        />
    </div>
</Drawer>

<!-- Recipient Drawer -->
<Drawer
    bind:hidden={hideRecipient}
    transitionType="fly"
    {transitionParams}
    placement="right" 
    width="w-full max-w-[600px]"
>
    <div>
        <div class="flex justify-end">

        </div>
        <Recipient 
            formData={item}
            showBackButton={true}
            on:index={(e) => {
                hideRecipient = true;
                if (e.detail == 0) return;
            }}
        />
    </div>
</Drawer>

<!-- Billing Drawer -->
<Drawer
    bind:hidden={hideBilling}
    transitionType="fly"
    {transitionParams}
    placement="right" 
    width="w-full max-w-[600px]"
>
    <div>
        <div class="flex justify-end">

        </div>
        <Shipment 
            formData={item}
            showBackButton={true}
            on:index={(e) => {
                hideBilling = true;
                if (e.detail == 2) return;
            }}
        />
    </div>
</Drawer>

<WaybillPrint items={[$item]} id="waybill-print" class="hidden" />

<WaybillPrintThermal bind:node={labelLayout} items={[$item]} id="waybill-thermal-print" class="hidden" />

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
    @media print {
        @page {
            margin: 0;
            transform: scale(0.60);
        }
    }
</style>