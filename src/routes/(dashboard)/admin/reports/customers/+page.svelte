<script>
    import { read, utils, writeFile } from 'xlsx';
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import WaybillsFilter from '$lib/components/dashboard/admin/WaybillsFilter.svelte';
    import { Breadcrumb, BreadcrumbItem, Button, Drawer, Input } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilAdobeAlt, UilCloudDownload, UilSlidersVAlt, UilTable } from "svelte-unicons";
    import { sineIn } from 'svelte/easing';
    import { closeModal, showModal } from "$lib/stores/app";
    import GwxPagination from '$lib/components/dashboard/GWXPagination.svelte';

    let isLoading = false;
    let hideFilter = true;
    let items = [];
    let ids = [];
    let meta = { 
        page: 1, 
        limit: 10, 
        total: 0, 
        role: "user,customer",
        scope: "individual,business",
        count_waybill: "true",
        full: true,
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
                path: "/users",
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
                path: "/users",
                query: Object.assign({}, meta, {limit: meta.total}),
            });

            const json = await res.json();
            if (!res.ok) throw json;

            // generate the xlxs
            const headers = ["ID", "Name", "Email", "Phone", "Account Type", "No of  Waybills", "Status", "Address", "Date Created", ];
            const aoa = [headers];

            for (let index = 0; index < json.data.length; index++) {
                const el = json.data[index];
                let a = Array.from(headers).map(e => "");

                // id
                a[0] = el.id;
                // name
                a[1] = el.name;
                // email
                a[2] = el.email || "";
                // phone
                a[3] = el.phone || ""
                // account type
                a[4] = el.scope?.toUpperCase() || ""
                // no of waybills
                a[5] = el.waybill_count || 0;
                // status
                a[6] = el.status?.toUpperCase() || "";
                // address
                a[7] = el.address || "";
                // date created
                a[8] = dayjs(el.created_at).format('DD-MM-YYYY');

                // push to the array
                aoa.push(a);
            }

            const ws = utils.aoa_to_sheet(aoa, { dense: true });
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Sheet1");
            writeFile(wb, "Customers.xlsx");
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
    <div class="flex justify-between mb-6">
        <div class="flex gap-2 items-center">
            <!-- <Button color="alternative" size="xs" class="gap-2" on:click={() => (hideFilter = false)} outline>
                <UilSlidersVAlt size="17" />
                Filter
            </Button> -->
            <Input
                type="date"
                bind:value={meta.date_min}
                on:change={(e) => {
                    (meta.date_min = e.target.value);
                    getData();
                }}
            />
            -
            <Input
                type="date"
                bind:value={meta.date_max}
                min="{meta.date_min ? dayjs(meta.date_min).format('YYYY-MM-DD') : ''}"
                on:change={(e) => {
                    (meta.date_max = e.target.value)
                    getData();
                }}
            />
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
                    <th>ID</th>
                    <th class="min-w-[100px]">Name</th>
                    <th class="min-w-[150px]">Email</th>
                    <th class="min-w-[100px]">Phone</th>
                    <th class="min-w-[100px]">Type</th>
                    <th class="min-w-[120px]">No of Waybills</th>
                    <th class="min-w-[100px]">Status</th>
                    <th class="min-w-[100px]">Date</th>
                </tr>
            </thead>
            <tbody>
            {#each items as item (item.id)}
                <tr>
                    <td>
                        <span>{ item.id }</span>
                    </td>
                    <td>
                        <span>{ item.name || '' }</span>
                    </td>
                    <td>
                        <span>{ item.email || "" }</span>
                    </td>
                    <td>
                        <span>{ item.phone || "" }</span>
                    </td>
                    <td>
                        <span class="capitalize">{ item.scope }</span>
                    </td>
                    <td>
                        <span>{ item.waybill_count || 0 }</span>
                    </td>
                    <td>
                        <span class="capitalize">{ item.status?.replaceAll("-", " ") }</span>
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

    <GwxPagination 
        currentPage={meta.page}
        pageSize={meta.limit}
        totalItems={meta.total}
        on:setPage={(e) => {
            meta.page = e.detail.page;
            getData();
        }}
        on:setPageSize={(e) => {
            meta.limit = e.detail.size;
            getData();
        }}
        class="w-full mt-8"
    />
</div>

<Drawer
    bind:hidden={hideFilter} 
    placement="right" 
    transitionType="fly"
    transitionParams={{x: 320, duration: 200, easing: sineIn}}>

    <WaybillsFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>