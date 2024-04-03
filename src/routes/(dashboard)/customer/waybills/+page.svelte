<script>
    import { utils, writeFile } from 'xlsx';
    import dayjs from 'dayjs';
    import { PaginationNav } from "svelte-paginate";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { onMount } from "svelte";
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import { UilArchive, UilPlus, UilSlidersVAlt, UilTable } from "svelte-unicons";
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import { goto } from '$app/navigation';
    import { sineIn } from 'svelte/easing';
    import { Breadcrumb, BreadcrumbItem, Button, Drawer } from 'flowbite-svelte';
    import WaybillsFilter from '$lib/components/dashboard/admin/WaybillsFilter.svelte';
    import { showModal, closeModal } from '$lib/stores/app';

    let isLoading = false;
    let hideFilter = true;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
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
        }
    }

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }

    function onSearch(e) {
        meta.search = e.detail;
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
            writeFile(wb, "NIS-Applications.xlsx");
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

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/customer" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Waybills</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex items-center gap-x-3 mb-4">
        <h2 class="text-lg font-semibold">Waybills</h2>

        <div class="flex flex-1 justify-end">
            <a href="/customer/waybills/create" class="btn btn-outline btn-primary btn-sm font-normal text-xs">
                <span><UilPlus size="20" /></span>
                New Waybill
            </a>
        </div>
    </div>

    <div class="flex justify-between">
        <div class="relative md:max-w-xs mt-2" class:hidden={isLoading && items.length}>
            <SearchBox placeholder="Search waybill" on:search={onSearch} />
        </div>
        <div class="flex-1 flex md:justify-end items-center space-x-2">
            <Button color="light" size="sm" class="space-x-1" on:click={() => (hideFilter = false)} outline>
                <span><UilSlidersVAlt size="18"/></span>
                <span>Filter</span>
            </Button>
            <Button size="xs" class="gap-2 w-[90px]" outline on:click={() => (downloadAsCSV())}>
                <span><UilTable size="17" /></span>
                <span>Export</span>
            </Button>
        </div>
    </div>

    

    <ListShimmer show={isLoading && !items.length } />

    <div class="md:hidden my-6">
        {#each items as item (item.id) }
        <div class="flex px-5 py-4 gap-4 bg-base-100 hover:bg-slate-50 cursor-pointer border-b border-b-slate-50 items-center item relative">
            <div class="flex-none grid place-content-center rounded-full w-10 h-10 text-accent bg-accent/5">
                <UilArchive size="20" />
            </div>
            <div class="flex-1 text-sm flex flex-col gap-y-1">
                <div class="text-sm text-base-content/80 font-medium">
                    #{ item.waybill_number }
                </div>
                <span class="text-xs text-base-content/40">{ dayjs(item.created_at).format('DD/MM/YYYY') }</span>
            </div>
            <div class="flex flex-col items-end gap-y-1">
                <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase">
                    { item.status }
                </span>
            </div>

            <button on:click={() => goto("/customer/waybills/" + item.id)}/>
        </div>
        {/each}
    </div>


    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table table-xs custom table-auto hidden md:table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th class="min-w-[100px]">Name</th>
                    <th class="min-w-[100px]">Sender</th>
                    <th class="min-w-[100px]">Recipient</th>
                    <th class="min-w-[100px]">Status</th>
                    <th class="min-w-[100px]">Date</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr>
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
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase">
                            { item.status }
                        </span>
                    </td>
                    <td>
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                    <td>
                        <a href="/customer/waybills/{item.id}" class="btn btn-ghost btn-xs uppercase text-primary">Details</a>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div 
        class="flex justify-between items-center gwx-paginator bg-base-100 px-8 py-3 border-t border-t-slate-100"
        class:hidden={!meta.total}
    >
        <span class="text-sm text-base-content/70">
            Total: {meta.total}
        </span>
        <PaginationNav 
            currentPage={meta.page}
            limit={meta.limit}
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

    <WaybillsFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>

<style lang="postcss" scoped>
.item:hover button {
    @apply absolute left-0 right-0 top-0 bottom-0;
}
</style>