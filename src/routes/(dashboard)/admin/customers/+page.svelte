<script>
    import dayjs from 'dayjs';
    import { Tabs, TabItem, Button, Drawer, Dropdown, DropdownItem, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
    import { PaginationNav } from "svelte-paginate";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { onMount } from "svelte";
    import { sineIn } from 'svelte/easing';
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import { getInitials } from '$lib/utils/helpers';
    import { UilAngleDown, UilPlus } from 'svelte-unicons';
    import CustomerDrawer from '$lib/components/dashboard/admin/CustomerDrawer.svelte';
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import GwxPagination from '$lib/components/dashboard/GWXPagination.svelte';

    let hideDrawer = true;
    let isLoading = false;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        role: "user,customer",
        scope: "individual",
        count_waybill: "true",
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
        }
    }

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }

    function onScopeChanged(e) {
        if (e == meta.scope) return;
        meta.scope = e.toLowerCase();
        getData()
    }

    function onCloseDrawer(e) {
        hideDrawer = true;
        if (e.detail) {
            getData();
        }
    }

    function createCustomer() {
        hideDrawer = false;
    }

    function onSearch(e) {
        meta.search = e.detail;
        getData();
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Customers</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <h2 class="text-lg font-semibold mb-4">Customers</h2>

    <div class="relative">
        <Tabs style="underline" contentClass="p-0">
            {#each ["Individual", "Business"] as item, index }
                <TabItem 
                    open={index == 0}
                    title="{item}" 
                    on:click={() => onScopeChanged(item)} 
                /> 
            {/each}
        </Tabs>
    </div>

    <div class="flex mt-4">
        <div>
            <SearchBox placeholder="Search users" on:search={onSearch} />
        </div>
        <div class="flex flex-1 gap-x-2 justify-end items-center">
            <div>
                <Button color="alternative" size="sm" class="space-x-1 w-36 justify-between">
                    <span>{ statuses[meta.status] || "All" }</span>
                    <span><UilAngleDown size="18"/> </span>
                </Button>
                <Dropdown containerClass="w-36 z-50 -right-4">
                    {#each Object.entries(statuses) as item }
                    <DropdownItem 
                        class="{ item[0] === meta.role ? 'bg-slate-50' : ''} text-sm"
                        on:click={() => (setTimeout(() => { 
                            meta.status = item[0];
                            getData();
                         }, 200))}
                        >
                        <span class="text-xs">{ item[1] }</span>
                    </DropdownItem>
                    {/each}
                </Dropdown>
            </div>
            <Button size="xs" class="space-x-1" on:click={createCustomer} outline>
                <span><UilPlus size="16" /></span>
                <span>New</span>
            </Button>
        </div>
    </div>
    

    <ListShimmer show={isLoading && !items.length }/>

    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table custom">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th class="">No of Waybills</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr class="text-xs">
                    <td>
                        <div class="flex items-center gap-x-3">
                            <div class="avatar placeholder">
                                <div class="rounded-full w-12 h-12 bg-slate-50">
                                    <span class="font-semibold">{ getInitials(item.name) }</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-y-1">
                                <div class="font-medium">{ item.name }</div>
                                <div class="text-base-content/40 text-xs">{ item.email }</div>
                            </div>
                        </div>
                    </td>
                    <td>{ item.phone || 'Not set' }</td>
                    <td>
                        <span>{ item.waybill_count || 0 }</span>
                    </td>
                    <td>
                        <span class="bg-success/5 text-xs text-success rounded-md py-1 px-2 capitalize">
                            { item.status || 'active' }
                        </span>
                    </td>
                    <td class="text-xs">
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                    <th>
                        <a href="/admin/customers/{item.id}" class="btn btn-ghost btn-xs uppercase text-primary">Details</a>
                    </th>
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
    bind:hidden={hideDrawer} 
    placement="right" 
    transitionType="fly"
    activateClickOutside={false}
    {transitionParams}
    width="w-full max-w-[500px]"
>
    <CustomerDrawer on:close={onCloseDrawer} />
</Drawer>