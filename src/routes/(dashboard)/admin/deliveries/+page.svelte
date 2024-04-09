<script>
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import GwxPagination from "$lib/components/dashboard/GWXPagination.svelte";
    import SearchBox from "$lib/components/dashboard/SearchBox.svelte";
    import { Breadcrumb, BreadcrumbItem, Button, Select, Tooltip } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { PaginationNav } from "svelte-paginate";
    import { UilApps, UilEnvelopes, UilEye, UilFastMail, UilPlus } from "svelte-unicons";

    const user = $page.data.session.user;

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
        "pending": "Sorted",
        "en-route": "In Transit",
        "completed": "Delivered",
        "canceled": "Canceled",
    }

    async function getData() {
        isLoading = true;

        try {
            const res = await clientFetch({
                path: "/deliveries",
                query: meta
            });
            const json = await res.json();
            items = json.data;
            meta = Object.assign(meta, json.meta);  
        } catch (error) {
            
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
            case "created": 
            case "queued": return "bg-slate-100";
            case "in-transit": return "bg-secondary/5 text-secondary";
            case "delivered":
            case "completed": return "bg-success/5 text-success";
            case "returned":
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }

</script>

<svelte:head>
    <title>GWX:: Admin Delivery Page</title>
</svelte:head>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Deliveries</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="mb-3">
        <h2 class="font-bold text-md">Deliveries</h2>
        <p class="text-sm text-base-content/70">
            A list of all last mile deliveries
        </p>
    </div>

    <div class="flex flex-1 justify-between items-end mt-6">
        <div class="relative md:max-w-xs">
            <SearchBox 
                placeholder="Search deliveries" 
                on:search={onSearch} 
                disabled={isLoading} />
        </div>

        <div class="flex gap-x-3">
            <Select 
                size="sm"
                bind:value={meta.status}
                items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
                on:change={() => (getData())}
                placeholder="Select Status"
                class="w-40 px-4"
            />
            <Button 
                id="single"
                size="sm" 
                outline
                href="/admin/deliveries/create"
                class="space-x-2 text-sm font-normal" >
                <span><UilFastMail size="25" /></span>
            </Button>
            <Button
                id="bulk"
                color="light"
                href="/admin/deliveries/create/bulk"
                outline
                class="space-x-2">
                <span><UilEnvelopes size="16" /></span>
            </Button>
            <Tooltip triggeredBy="#bulk">Create bulk deliveries</Tooltip>
            <Tooltip triggeredBy="#single">Create single delivery</Tooltip>
        </div>
    </div>

    <div class="overflow-x-auto w-full mt-4">
        <table class="table table-xs custom w-full">
            <thead>
                <tr>
                    <th class="min-w-[100px]">ID</th>
                    <th>Package</th>
                    <th class="min-w-[100px]">Sender</th>
                    <th class="min-w-[100px]">Recipient</th>
                    <th class="min-w-[100px]">Courier</th>
                    <th class="min-w-[100px]">Origin Hub</th>
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
                        <span>{item.package.name}</span>
                    </td>
                    <td>
                        <span>{ item.package.sender.name }</span>
                    </td>
                    <td>
                        <span>{ item.package.recipient.name }</span>
                    </td>
                    <td>
                        <span>{ item.courier.name }</span>
                    </td>
                    <td>
                        <span class="capitalize">{ item.hub.name }</span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ item.status.replace("-", " ") }</span>
                    </td>
                    <td>
                        <Button
                            href="/admin/deliveries/{item.id}"
                            size="xs"
                            class="space-x-1 p-2 bg-primary/5 text-primary-500 hover:bg-primary/10"
                        >
                            <span><UilEye size="17"/></span>
                            <span>Details</span>
                        </Button>
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