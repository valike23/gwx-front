<script>
    import { onMount } from "svelte";
    import { PaginationNav } from "svelte-paginate";
    import { sineIn } from 'svelte/easing';
    import { UilPlus } from "svelte-unicons";
    import { clientFetch } from "$lib/client/api";
    import SearchBox from "$lib/components/dashboard/SearchBox.svelte";
    import { Breadcrumb, BreadcrumbItem, Button, Select, Drawer, CloseButton } from "flowbite-svelte";
    import TerminalDrawer from "$lib/components/dashboard/admin/TerminalDrawer.svelte";

    let isLoading = false;
    let items = [];
    let hideModal = true;
    let selectedHub = null;
    let meta = {
        page: 1,
        limit: 10,
        total: 15,
        status: ""
    }
    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    const statuses = {
        "": "All",
        "active": "Active",
        "inactive": "Inactive"
    };

    onMount(() => {
        getData();
    });

    async function getData() {
        isLoading = true;

        let query = new URLSearchParams(meta);

        try {
            const res = await clientFetch({
                path: "/hubs",
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

    function statusClass(val) {
        switch (val) {
            case "active": return "bg-success/5 px-3 py-1 text-2xs text-success ";
            case "inactive": return "bg-warning/5 px-3 py-1 text-2xs text-warning ";
            default: return ""
        }
    }

    function onStatusChanged() {
        meta.status = selectedStatus;
        getData();
    }

    function onSearch(e) {
        meta.search = e.detail;
        getData();
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Terminals</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-3 items-center">
        <h2 class="font-medium">Terminals</h2>
    </div>

    <div class="flex justify-between items-center">
        <div class="relative md:max-w-xs mt-2">
            <SearchBox placeholder="Search terminals" on:search={onSearch} />
        </div>

        <div class="flex items-center gap-x-2">
            <Select 
                size="sm"
                bind:value={meta.status}
                items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
                on:change={() => (getData())}
                placeholder="Select Status"
                class="max-w-[180px]"
            />
            <Button class="space-x-1 font-normal" size="sm" on:click={() => {
                hideModal = false;
                selectedHub = null;
            }} outline>
                <span><UilPlus size="15" /></span>
                <span>New</span>
            </Button>
        </div>
    </div>

    <div class="overflow-x-auto w-full mt-4">
        <table class="table table-xs custom w-full">
            <thead>
                <tr>
                    <th class="">Code</th>
                    <th class="min-w-[120px]">Name</th>
                    <th>Address</th>
                    <th>Express</th>
                    <th class="w-[100px]">Status</th>
                    <th class="w-[100px]"></th>
                </tr>
            </thead>
            <tbody>
            {#each items as item (item.id) }
                <tr>
                    <td>
                        <span>{ item.code }</span>
                    </td>
                    <td>
                        <span>{ item.name }</span>
                    </td>
                    <td>
                        <span>
                            { item.address }
                        </span>
                    </td>
                    <td>
                        <span>
                            { item.is_express ? "Yes" : "No" }
                        </span>
                    </td>
                    <td>
                        <span class="{statusClass(item.status)} uppercase font-medium rounded-md">
                        { item.status }</span>
                    </td>
                    <td>
                        <a href="/admin/terminals/{item.id}" class="bg-info/5 px-3 py-1 text-2xs text-base-content/50 rounded-md uppercase font-bold hover:bg-info/20 transition-all">Details</a>
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
    bind:hidden={hideModal} 
    placement="right" 
    transitionType="fly"
    activateClickOutside={false}
    {transitionParams}
>
    <div>
        <div class="flex">
            <CloseButton on:click={() => {
                hideModal = true;
                selectedHub = null;
            }}/>
        </div>
        <TerminalDrawer data={selectedHub} on:close={(e) => {
            hideModal = true;
            selectedHub = null;
            if (e.detail) {
                getData();
            }   
        }} />
    </div>
</Drawer>