<script>
    import { read, utils, writeFile } from 'xlsx';
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import WaybillsFilter from '$lib/components/dashboard/admin/WaybillsFilter.svelte';
    import { Breadcrumb, BreadcrumbItem, Button, Drawer } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { PaginationNav } from "svelte-paginate";
    import { UilAdobeAlt, UilCloudDownload, UilSlidersVAlt, UilTable } from "svelte-unicons";
    import { sineIn } from 'svelte/easing';
    import { closeModal, showModal } from "$lib/stores/app";
    import DeliveriesFilter from '$lib/components/dashboard/admin/DeliveriesFilter.svelte';

    let isLoading = false;
    let hideFilter = true;
    let items = [];
    let ids = [];
    let meta = { 
        page: 1, 
        limit: 10, 
        total: 0, 
        status: "",
        date_min: dayjs().subtract(3, 'month').format('YYYY-MM-DD')
    }

    onMount(() => {
        getData();
    })

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
            meta = Object.assign({}, meta, json.meta);    
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

    function onFilter(e) {
        meta = Object.assign({}, meta, e.detail);
        hideFilter = true;
        getData();
    }

    async function downloadAsCSV() {
        if (!meta.total) return;

        showModal();

        try {
            const res = await clientFetch({
                path: "/packages",
                query: Object.assign({}, meta, {limit: meta.total}),
            });

            const json = await res.json();
            if (!res.ok) throw json;

            // generate the xlxs
            const headers = ["Waybill Number", "Sender", "Status", "Date Created", "Delivery Date", "Origin", "Destination", "Address", "Recipient", "Recipient Phone"];
            const aoa = [headers];

            for (let index = 0; index < json.data.length; index++) {
                const el = json.data[index];
                let a = Array.from(headers).map(e => "");

                // waybill number
                a[0] = el.waybill_number;

                // sender
                a[1] = el.sender.name;

                // status
                a[2] = el.status.replaceAll("-", " ").toUpperCase();

                // Date Created
                a[3] = dayjs(el.created_at).format('DD-MM-YYYY');

                // Delivery Date
                const dd = (el.milestones || []).find(e => e.status == "delivered")?.timestamp;
                a[4] = dd ? dayjs(dd).format('DD-MM-YYYY') : '';

                // origin
                a[5] = el.sender.state?.name || "";

                // destination
                a[6] = el.recipient.state?.name || "";

                // address
                a[7] = el.recipient.address || "";

                // recipient
                a[8] = el.recipient.name || "";

                // phone
                a[9] = el.recipient.phone || "";

                // push to the array
                aoa.push(a);
            }

            const ws = utils.aoa_to_sheet(aoa, { dense: true });
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Sheet1");
            writeFile(wb, "Waybills.xlsx");
        } catch (error) {
            failure(error);
        } finally {
            closeModal();
        }
    }

</script>
<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Reports</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex justify-between">
        <div>
            <Button color="alternative" size="xs" class="gap-2" on:click={() => (hideFilter = false)} outline>
                <UilSlidersVAlt size="17" />
                Filter
            </Button>
        </div>
        <div class="flex justify-end gap-3 mb-6">
            <div class="tooltip hidden" data-tip="Export to PDF">
                <Button size="xs" class="gap-2" outline>
                    <UilAdobeAlt size="17" />
                    Export
                </Button>
            </div>
            <div class="tooltip" data-tip="Export to Sheets">
                <Button size="xs" class="gap-2" outline on:click={() => (downloadAsCSV())}>
                    <UilTable size="17" />
                    Export
                </Button>
            </div>
            
        </div>
    </div>
    
    <div class="w-full overflow-x-auto">

        <table class="table table-xs custom table-auto">
            <caption>

            </caption>
            <thead>
                <tr>
                    <th>No</th>
                    <th class="min-w-[100px]">Name</th>
                    <th class="min-w-[100px]">Sender</th>
                    <th class="min-w-[100px]">Recipient</th>
                    <th class="min-w-[100px]">Status</th>
                    <th class="min-w-[100px]">Date</th>
                </tr>
            </thead>
            <tbody>
            {#each items as item (item.id)}
                <tr>
                    <td>
                        <span>{ item.waybill_number }</span>
                    </td>
                    <td>
                        <span>{ item.name || '' }</span>
                    </td>
                    <td>
                        <span>{ item.sender.name }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.name }</span>
                    </td>
                    <td>
                        <span class="capitalize">{ item.status.replaceAll("-", " ") }</span>
                    </td>
                    <td>
                        <span>
                            {dayjs(item.created_at).format('DD-MM-YYYY')}
                        </span>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>

    <div 
        class="flex justify-between items-center gwx-paginator mt-8"
        class:hidden={!meta.total}
    >
        <span class="text-sm">
            Total: {meta.total}
        </span>
        <PaginationNav 
            currentPage={meta.page}
            limit={1}
            pageSize={meta.limit}
            totalItems={meta.total}
            on:setPage={(e) => setPage(e)}
        />
    </div>
</div>

<Drawer
    bind:hidden={hideFilter} 
    placement="right" 
    transitionType="fly"
    transitionParams={{x: 320, duration: 200, easing: sineIn}}>

    <DeliveriesFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>