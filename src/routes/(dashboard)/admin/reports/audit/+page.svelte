<script>
    import dayjs from 'dayjs';
    import { onMount } from 'svelte';
    import {sineIn} from 'svelte/easing';
    import { clientFetch } from '$lib/client/api';  
    import { failure, success } from '$lib/utils/toast';
    import {Breadcrumb, BreadcrumbItem, Input, Button, Drawer} from 'flowbite-svelte';   
    import { UilAdobeAlt, UilTable } from "svelte-unicons";
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
                path: "/logs",
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
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/reports" home>Reports</BreadcrumbItem>
        <BreadcrumbItem>Audit Trail</BreadcrumbItem>
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
                <Button size="xs" class="gap-2" outline on:click={() => (console.log("test"))}>
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
                    <th class="min-w-[150px]">Action</th>
                    <th class="min-w-[150px]">Email</th>
                    <th class="min-w-[100px]">entity</th>
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
                        <span class="capitalize">{ item.action }</span>
                    </td>
                    <td>
                        <span>{ item.user_email || '' }</span>
                    </td>
                    <td>
                        <span>{ item.type || '' }</span>
                    </td>
                  
                    <td>
                        <span>
                            {dayjs(item.created_at).format('DD-MM-YYYY HH:MM A')}
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