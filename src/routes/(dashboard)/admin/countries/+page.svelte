<script>
    import dayjs from 'dayjs';
    import { PaginationNav } from "svelte-paginate";
    import { clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { onMount } from "svelte";
    import { sineIn } from 'svelte/easing';
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import { UilEditAlt, UilEye, UilInfoCircle, UilPlus, UilTrashAlt } from "svelte-unicons";
    import { Breadcrumb, BreadcrumbItem, Button, Drawer, Popover } from 'flowbite-svelte';
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import CountryDrawer from '$lib/components/dashboard/admin/CountryDrawer.svelte';

    let isLoading = false;
    let hideDrawer = true;
    let selectedCountry;
    let items = [];
    let meta = {
        page: 1,
        limit: 10,
        total: 0,
        role: "user",
        count_states: "yes"
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
                path: "/countries",
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
    const  removeCountry = async (country)=>{
      const res = await  clientFetch({path: `/countries/${country.id}`, method: 'DELETE'});
      const json = await res.json();
      if (!res.ok) throw json;
      getData();

    }

    function setPage(val) {
        meta.page = val.detail.page;
        getData();
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem>Countries</BreadcrumbItem>
    </Breadcrumb>
</div>
<div class="page">
    <h2 class="text-lg font-semibold">Countries</h2>

    <div class="flex mt-4">
        <div>
            <SearchBox placeholder="Search countries" on:search={(e) => {
                meta.search = e.detail;
                getData();
            }} />
        </div>
        <div class="flex flex-1 gap-x-2 justify-end items-center">
            <Button class="space-x-1 font-normal" size="sm" on:click={() => (hideDrawer = false)} outline>
                <span><UilPlus size="15" /></span>
                <span>New</span>
            </Button>
        </div>
    </div>

    <ListShimmer show={isLoading && !items.length }/>

    <div class="overflow-x-auto w-full mt-4" class:hidden={isLoading && !items.length}>
        <table class="table custom">
            <thead>
                <tr>
                    <th class="w-[100px]">Code</th>
                    <th>Name</th>
                    <th>States</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th class="w-[120px]"></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr class="text-xs">
                    <td>
                        <span>{ item.code }</span>
                    </td>
                    <td>
                        <div id="country-{item.id}" class="flex items-center space-x-1 hover:underline cursor-pointer">
                            <span>{ item.name }</span>
                            <span><UilInfoCircle size="15" /></span>
                        </div>
                        <Popover 
                            triggeredBy="#country-{item.id}"
                            placement="top"
                            class="w-64 z-20"
                        >
                            <div class="p-3">
                                <div>
                                    <strong>{ item.name }</strong> - {item.state_count} States
                                </div>
                            </div>
                        </Popover>
                        
                    </td>
                    <td>
                        <a 
                            href="/admin/states?country_id={item.id}"
                            class="text-primary underline"
                        >
                            {item.state_count || 0} States
                        </a>
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
                         <Button 
                            size="xs" 
                            color="none" 
                            class="space-x-1 text-primary bg-primary/5 uppercase text-2xs font-semibold"
                            on:click={() => {
                                selectedCountry = item;
                                hideDrawer = false;
                            }}
                        >
                            <span><UilEditAlt size="12"/></span>
                            <span>Edit</span>
                         </Button>
                         <Button size="xs" color="red" on:click={()=>{removeCountry(item)}}
                          class="space-x-1 text-primary uppercase text-2xs font-semibold">
                            <span><UilTrashAlt size="12"/></span>
                         </Button>
                    </th>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div 
        class="flex justify-end gwx-paginator mt-8"
        class:hidden={!meta.total}
    >
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
    bind:hidden={hideDrawer} 
    placement="right" 
    transitionType="fly"
    {transitionParams}
    activateClickOutside={false}
>
    <CountryDrawer data={selectedCountry} on:close={(e) => {
        hideDrawer = true;
        selectedCountry = null;
        if (e.detail) {
            getData();
        }
    }} />
</Drawer>