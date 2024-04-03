<script>
    import { PaginationNav } from "svelte-paginate";
    import { Breadcrumb, BreadcrumbItem, Button, Dropdown, DropdownItem, Select } from 'flowbite-svelte';
    import { UilAngleDown, UilCheck, UilPlus, UilSearch } from "svelte-unicons";
    import SearchBox from "$lib/components/dashboard/SearchBox.svelte";
    import { clientFetch } from "$lib/client/api";
    import { onMount } from "svelte";
    import GwxPagination from "$lib/components/dashboard/GWXPagination.svelte";

    let isLoading = false;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        status: ""
    }

    onMount(() => {
        getData();
    })

    const statuses = {
        "": "All",
        "in-transit": "In Transit",
        "delivered": "Delivered",
        "canceled": "Canceled",
        "returned": "Returned"
    }

    let selectedStatus = statuses[0];

    async function getData() {

        isLoading = true;

        const query = new URLSearchParams(meta);

        try {
            const res = await clientFetch({
                path: "/shipments",
                query: query.toString()
            });
            const json = await res.json();
            items = json.data;
            meta = Object.assign(meta, json.meta);  
        } catch (error) {
            
        } finally {
            isLoading = false;
        }
    }

    function onSearch(e) {
        meta.search = e.detail;
        getData();
    }

    function statusStyle(val) {
        switch (val) {
            case "created": 
            case "queued": return "bg-slate-100";
            case "in-transit": return "bg-secondary/5 tex-secondary";
            case "delivered": return "bg-success/5 text-success";
            case "returned":
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }


    // Manifest, No of Items, Seal Tag, Status, Last scan, Orgin, Destination, Trans mode, Carrier, Days spent
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Shipments</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-3 justify-between items-center mb-3">
        <h2 class="font-bold text-md">Shipments</h2>
    </div>

    <div class="flex flex-1 justify-between items-end mt-6">
        <div class="relative md:max-w-xs">
            <SearchBox 
                placeholder="Search shipments" 
                on:search={onSearch} />
        </div>

        <div class="flex gap-x-3">
            <Select 
                size="sm"
                bind:value={meta.status}
                items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
                on:change={() => (getData())}
                placeholder="Select Status"
                class="w-36"
            />
            <Button size="sm" class="space-x-2 text-sm font-normal" href="/admin/shipments/create"  outline>
                <span><UilPlus size="18" /></span>
                <span>Generate Manifest</span>
            </Button>
        </div>
    </div>


    <div class="overflow-x-auto w-full mt-4">
        <table class="table table-xs custom w-full">
            <thead>
                <tr>
                    <th class="min-w-[150px]">Manifest No</th>
                    <th>No of Items</th>
                    <th class="min-w-[100px]">Origin</th>
                    <th class="min-w-[100px]">Destination</th>
                    <th class="min-w-[100px]">Trans-Mode</th>
                    <th class="min-w-[100px]">Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {#each items as item (item.id) }
                <tr>
                    <td>
                        <span>{item.id}</span>
                    </td>
                    <td>
                        <span>{item.package_ids.length}</span>
                    </td>
                    <td>
                        <span>{ item.origin.name }</span>
                    </td>
                    <td>
                        <span>{ item.destination.name }</span>
                    </td>
                    <td>
                        <span class="capitalize">{ item.mode }</span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ item.status.replace("-", "") }</span>
                    </td>
                    <td>
                        <a href="/admin/shipments/{item.id}"ssssss class="bg-info/5 px-3 py-1 text-2xs text-base-content/50 rounded-md uppercase font-bold hover:bg-info/20 transition-all">Details</a>
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