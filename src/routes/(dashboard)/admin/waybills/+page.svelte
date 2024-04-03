<script>
    import dayjs from 'dayjs';
    import printJS from "print-js";
    import html2pdf from "html2pdf.js";
    import { clientFetch } from "$lib/client/api";
    import { failure, success } from "$lib/utils/toast";
    import { onMount } from "svelte";
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import { UilAngleDown, UilCloudUpload, UilDownloadAlt, UilPlus, UilSlidersVAlt } from "svelte-unicons";
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import { Breadcrumb, BreadcrumbItem, Button, Checkbox, Dropdown, DropdownItem, Drawer, Modal } from 'flowbite-svelte';
    import WaybillPrint from '$lib/components/dashboard/WaybillPrint.svelte';
    import { closeModal, showModal } from '$lib/stores/app';
    import { writable } from 'svelte/store';
    import { debounce } from '$lib/utils/helpers';
    import { sineIn } from 'svelte/easing';
    import BulkWaybillUploadModal from '$lib/components/dashboard/BulkWaybillUploadModal.svelte';
    import WaybillsFilter from '$lib/components/dashboard/admin/WaybillsFilter.svelte';
    import GwxPagination from '$lib/components/dashboard/GWXPagination.svelte';
    import WaybillPrintThermal from '$lib/components/dashboard/WaybillPrintThermal.svelte';
    import { TicketOutline } from 'svelte-ionicons';
    import { computeStatus } from '$lib/client/helpers';

    let isLoading = false;
    let bulkModal = false;
    let hideFilter = true;
    let labelLayout;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        status: "",
    }

    let ids = [];
    const waybills = writable([]);

    const statuses = {
        "": "All",
        "new": "New",
        "out-for-delivery": "Out for delivery",
        "delivered": "Delivered"
    }

    onMount(() => {
        getData();
    });

    async function getData() {
        isLoading = true;

        let query = new URLSearchParams(meta);

        try {
            const res = await clientFetch({
                path: "/packages",
                query: query.toString()
            });

            const json = await res.json();
            if (!res.ok) throw json;
            items = json.data
            meta = Object.assign(meta, json.meta);    
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
            ids = [];
        }
    }

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }

    function setPageSize(val) {
        meta.limit = val.detail.size;
        getData();
    }

    function statusStyle(val) {
        switch (val) {
            case "new": 
            case "queued": return "bg-slate-100";
            case "pending": return "bg-secondary/5 tex-secondary";
            case "processing": return "bg-info/5 text-info";
            case "in-transit": return "bg-warning/5 text-warning";
            case "out-for-delivery": return "bg-accent/5 text-accent";
            case "delivered": return "bg-success/5 text-success";
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }

    function onSearch(e) {
        meta.search = e.detail;
        getData();
    }

    function onStatus(e) {
        if (meta.status == e) return;
        meta.status = e;
        getData();
    }

    async function printWaybills() {

        if (!ids.length) return;

        showModal();

        debounce(() => {
            const lay = document.getElementById("waybill-print-layout");
            const container = document.createElement("div");    
            container.innerHTML = lay.innerHTML;    

            html2pdf(container, {
                margin: 0,
                filename: `bulk-waybills.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }).save()
            closeModal();
        }, 1000);
    }

    async function sendToThermal() {

        if (!ids.length) return;

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

    async function sendData(payload) {
        showModal();
        try {
            const res = await clientFetch({
                path: "/packages/bulk",
                method: "POST",
                body: {
                    "create": payload
                }
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success(json.message);
        } catch (error) {
            failure(error);
        } finally {
            closeModal();
        }
    }

    function onFilter(e) {
        meta = Object.assign(meta, e.detail);
        hideFilter = true;
        getData();
    }
</script>

<svelte:head>
    <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> -->
</svelte:head>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Waybills</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page print:hidden">

    <div class="flex items-center gap-x-3 mb-4">
        <h2 class="text-lg font-semibold">Waybills</h2>

        <div class="flex flex-1 justify-end">
        </div>
    </div>

    <div class="flex flex-col md:flex-row gap-y-4 gap-x-6 justify-between">
        <div class="flex items-center gap-4 mt-2">
            <div class="relative w-full md:max-w-sm">
                <SearchBox placeholder="Search waybills" on:search={onSearch} />
            </div>
            <div class="tooltip tooltip-bottom" data-tip="Download waybills">
                <button 
                    class="btn btn-outline btn-primary btn-circle btn-sm"
                    on:click={() => (printWaybills())}>
                    <UilDownloadAlt size="20" />
                </button>
            </div>
            <div class="tooltip tooltip-top" data-tip="Upload Waybills">
                <a 
                    href="/admin/waybills/bulk"
                    class="btn btn-outline btn-primary btn-circle btn-sm">
                    <UilCloudUpload size="20" />
                </a>
            </div>
            <div class="tooltip tooltip-top" data-tip="Print labels">
                <button 
                    class="btn btn-outline btn-primary btn-circle btn-sm"
                    on:click={() => (sendToThermal())}>
                    <span><TicketOutline size="20" /></span>
                </button>
            </div>
        </div>
        <div class="flex w-full gap-x-3 md:flex-1 md:justify-end items-center">
            <Button color="light" size="sm" class="space-x-1" on:click={() => (hideFilter = false)} outline>
                <span><UilSlidersVAlt size="18"/></span>
                <span>Filter</span>
            </Button>
            <div class="hidden">
                <Button color="alternative" size="sm" class="space-x-1 w-40 justify-between">
                    <span>{ statuses[meta.status] || "All" }</span>
                    <span><UilAngleDown size="18"/> </span>
                </Button>
                <Dropdown containerClass="w-40 z-50 -right-4">
                    {#each Object.entries(statuses) as item }
                    <DropdownItem 
                        class="{ item[0] === meta.status ? 'bg-slate-50' : ''}"
                        on:click={() => (onStatus(item[0]))}
                        >
                        { item[1] }
                    </DropdownItem>
                    {/each}
                </Dropdown>
            </div>
            <Button size="sm" class="space-x-2 text-sm font-normal" href="/admin/waybills/create"  outline>
                <span><UilPlus size="18" /></span>
                <span>New</span>
            </Button>
        </div>
    </div>
    
    <ListShimmer show={isLoading && !items.length }/>
    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table table-xs custom table-auto">
            <thead>
                <tr>
                    <th>
                        <Checkbox 
                            checked={ids.length == items.length} 
                            on:change={(e) => { 
                                ids = e.target.checked ? items.map(e => e.id) : []
                            }}
                        />
                    </th>
                    <th>ID</th>
                    <th class="min-w-[100px]">Name</th>
                    <th class="min-w-[100px]">Sender</th>
                    <th class="min-w-[100px]">Recipient</th>
                    <th class="min-w-[130px]">Status</th>
                    <th class="min-w-[100px]">Date</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr>
                    <td>
                        <Checkbox bind:group={ids} value={item.id} on:change={() => {
                            waybills.set(items.filter(e => ids.includes(e.id)))
                        }} />
                    </td>
                    <td>{ item.waybill_number }</td>
                    <td>
                        <span>{ item.name || '' }</span>
                    </td>
                    <td>
                        <span>
                            { item.sender.name }
                        </span>
                    </td>
                    <td>
                        <span>
                            { item.recipient.name }
                        </span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ computeStatus(item.status) }</span>
                    </td>
                    <td>
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                    <td>
                        <a href="/admin/waybills/{item.id}" class="btn btn-ghost btn-xs uppercase text-primary">Details</a>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <GwxPagination 
        currentPage={meta.page}
        pageSize={meta.limit}
        totalItems={meta.total}
        on:setPage={(e) => setPage(e)}
        on:setPageSize={(e) => setPageSize(e)}
        class="w-full mt-8"
    />
</div>

<WaybillPrint items={$waybills} id="waybill-print-layout" class="hidden" />


<WaybillPrintThermal bind:node={labelLayout} items={$waybills} class="hidden" />


<Modal title="Upload Waybills" bind:open={bulkModal}>
    <BulkWaybillUploadModal 
        on:close={() => (bulkModal = false)}
        on:data={(e) => {
            bulkModal = false;
            sendData(e.detail);
        }}
    />
</Modal>

<Drawer
    bind:hidden={hideFilter} 
    placement="right" 
    transitionType="fly"
    transitionParams={{x: 320, duration: 200, easing: sineIn}}
>
    <WaybillsFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>