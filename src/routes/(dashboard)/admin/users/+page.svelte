<script>
    import { UilPlus, UilSlidersVAlt } from "svelte-unicons";
    import { PaginationNav } from "svelte-paginate";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { onMount } from "svelte";
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import dayjs from "dayjs";
    import { sineIn } from 'svelte/easing';
    import { getInitials } from "$lib/utils/helpers";
    import { Button, Drawer, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
    import SearchBox from "$lib/components/dashboard/SearchBox.svelte";
    import UsersFilter from "$lib/components/dashboard/admin/UsersFilter.svelte";
    import UserDrawer from "$lib/components/dashboard/admin/UserDrawer.svelte";
    import { roles } from "$lib/data/roles";
    import { page } from "$app/stores";
    import GwxPagination from "$lib/components/dashboard/GWXPagination.svelte";

    const user = $page.data.session.user;
    let isLoading = false;
    let items = [];
    let hideFilter = true;
    let hideUser = true;
    let selectedUser;
    let meta = {
        page: 1,
        limit: 10,
        role: "admin,hub,manager,courier,rider",
        total: 0,
        status: ""
    }
    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
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

    function onFilter(e) {
        meta = Object.assign(meta, e.detail);
        hideFilter = true;
        getData();
    }

    function statusClass(val) {
        switch (val) {
            case "active": return "bg-success/5 px-3 py-1 text-2xs text-success ";
            case "inactive": return "bg-warning/5 px-3 py-1 text-2xs text-warning ";
            default: return ""
        }
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Users</BreadcrumbItem>
    </Breadcrumb>
</div>
<div class="page">
    
    <div class="flex gap-3 justify-between items-center">
        <div class="flex items-center gap-x-3 flex-1">
            <h2 class="font-bold text-md">Users</h2>
        </div>
    </div>

    <div class="flex mt-4">
        <div>
            <SearchBox placeholder="Search users" on:search={onSearch} />
        </div>
        <div class="flex flex-1 gap-x-2 justify-end items-center">
            <Button color="alternative" size="sm" class="space-x-1" on:click={() => (hideFilter = false)} outline>
                <span><UilSlidersVAlt size="18"/></span>
                <span>Filter</span>
            </Button>
            {#if ["admin"].includes(user.role)}
            <Button href="/admin/users/create" class="space-x-1 font-normal" size="sm" outline>
                <span><UilPlus size="15" /></span>
                <span>New User</span>
            </Button> 
            {/if}
            
        </div>
    </div>

    <ListShimmer show={isLoading && !items.length }/>

    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table custom">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th class="w-14">Role</th>
                    <th class="w-14">Status</th>
                    <th class="w-14">Date Created</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr class="hover">
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
                    <td>
                        <span>
                            { item.phone || 'Not set' }
                        </span>
                    </td>
                    <td>
                        <span class="bg-success/5 text-xs text-success rounded-md py-1 px-2">
                            { roles[item.role] }
                        </span>
                    </td>
                    <td>
                        <span class="{statusClass(item.status || "active")} uppercase font-medium rounded-md">
                        { item.status || "active" }</span>
                    </td>
                    <td>
                        <span>{ dayjs(item.created_at).format("DD-MM-YYYY") }</span>
                    </td>
                    <th>
                        <a href="/admin/users/{item.id}" class="btn btn-ghost btn-xs uppercase text-primary">Details</a>
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
    bind:hidden={hideFilter} 
    placement="right" 
    transitionType="fly"
    {transitionParams}
>
    <UsersFilter 
        data={meta} 
        on:close={() => (hideFilter = true)} 
        on:data={onFilter}
    />
</Drawer>

<Drawer
    bind:hidden={hideUser} 
    placement="right" 
    transitionType="fly"
    activateClickOutside={false}
    {transitionParams}
    width="w-full max-w-[600px]"
>

    <UserDrawer data={selectedUser} on:close={(e) => {
        hideUser = true;
        selectedUser = null;
        if (e.detail) {
            getData();
        }
    }} />

</Drawer>