<script>
    import dayjs from 'dayjs';
    import { UilAngleLeft, UilEditAlt, UilEnvelope, UilPhoneAlt } from "svelte-unicons";
    import { page } from "$app/stores";
    import { roles } from "$lib/data/roles";
    import { Breadcrumb, BreadcrumbItem, Button } from 'flowbite-svelte';
    import { formatCurrency, getInitials } from '$lib/utils/helpers';
    import { onMount } from 'svelte';
    import { clientFetch } from '$lib/client/api';
    import { PaginationNav } from 'svelte-paginate';

    const user = $page.data.profile;
    let isLoading = false;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        customer_id: user.id
    }

    onMount(() => {
        getWaybills();
    })

    async function getWaybills() {
        isLoading = false;
        try {
            const res = await clientFetch({
                method: "GET",
                path: "/packages",
                query: meta
            });
            const json = await res.json();
            if (!res.ok) throw json;
            items = json.data;
            meta = json.meta;
        } catch (error) {
            
        } finally {
            isLoading = false;
        }
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

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }

</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/customers">Customers</BreadcrumbItem>
        <BreadcrumbItem>{ user.name }</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    
    <div class="">
        <h3 class="font-semibold text-lg">Customer Details</h3>
    </div>

    <div class="bg-base-100 p-4 shadow-sm rounded-md mt-4 flex gap-x-3 items-center">
        <div class="avatar">
            <div class="mask mask-circle rounded-full w-11 h-11">
                <div class="w-full h-full grid place-content-center font-semibold bg-primary/20 text-primary">
                    { getInitials(user.name) }
                </div>
            </div>
        </div>
        <div class="flex flex-col">
            <span class="text-sm">{ user.name }</span>
            <div class="flex text-xs gap-x-1 text-gray-500">
                <span class="text-xs ">{ user.email }</span>
                <span>{ user.phone || "" }</span>
            </div>
        </div>
    </div>

    <div class="w-full my-4 bg-base-100 shadow-sm rounded-md" class:hidden={isLoading && !items.length}>
        <div class="p-4 flex items-center">
            <h3 class="font-medium">Waybills</h3>
        </div>
        <div class="w-full overflow-x-auto">
            <table class="table table-xs custom">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th class="w-[110px]"></th>
                        <th class="w-[100px]"></th>
                        <th class="w-[120px]"></th>
                        <th class="w-[100px]"></th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as item (item.id)}
                    <tr>
                        <td>
                            <span>{ item.waybill_number }</span>
                        </td>
                        <!-- <td>
                            <span>John Doe</span>
                        </td> -->
                        <td>
                            <span>{ item.recipient.name }</span>
                        </td>
                        <td>
                            <span>
                                { item.recipient.address }
                            </span>
                        </td>
                        <td>
                            <span>{ formatCurrency(item.value) }</span>
                        </td>
                        <td>
                            <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ item.status }</span>
                        </td>
                        <td>
                            <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                        </td>
                        <td>
                            <a href="/admin/waybills/{item.id}" class="btn btn-xs btn-primary btn-outline font-normal h-7">
                                View
                            </a>
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
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