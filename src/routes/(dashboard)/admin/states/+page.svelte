<script>
    import dayjs from 'dayjs';
    import { PaginationNav } from "svelte-paginate";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { failure } from "$lib/utils/toast";
    import { sineIn } from 'svelte/easing';
    import { onMount } from "svelte";
    import ListShimmer from "$lib/components/ListShimmer.svelte";
    import { UilEditAlt, UilEnvelope, UilInfoCircle, UilPhone, UilPlus } from "svelte-unicons";
    import { page } from '$app/stores';
    import { Breadcrumb, BreadcrumbItem, Button, Drawer, Modal, Popover, Select } from 'flowbite-svelte';
    import SearchBox from '$lib/components/dashboard/SearchBox.svelte';
    import StateDrawer from '$lib/components/dashboard/admin/StateDrawer.svelte';
    import { goto } from '$app/navigation';

    let isLoading = false;
    let items = [];
    let countries = [];
    let hideModal = true;
    let selectedState;
    let meta = { page: 1, limit: 10, total: 0, country_id: $page.url.searchParams.get("country_id")}
    let transitionParams = { x: 320, duration: 200, easing: sineIn};

    onMount(() => {
        getCountries();
    });

    async function getData() {
        isLoading = true;

        let query = new URLSearchParams(meta);

        try {
            const res = await clientFetch({
                path: `/states`,
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

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        }).finally(() => {
            let ng = countries.find(e => e.code == "NG");
            if (ng) {
                meta.country_id = ng.id;
                getData();
            }
        });
    }

    function onCountryChanged(e) {
        $page.url.searchParams.set("country_id", e.target.value);
        goto($page.url, {replaceState: true});
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
        <BreadcrumbItem>States</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <h2 class="text-lg font-semibold">States</h2>

    <div class="flex mt-4">
        <div>
            <SearchBox placeholder="Search states" on:search={(e) => {
                meta.search = e.detail;
                getData();
            }} />
        </div>
        <div class="flex flex-1 gap-x-2 justify-end items-center">
            <Select 
                size="sm"
                bind:value={meta.country_id}
                items={countries.map(e => ({value: e.id, name: e.name}))}
                on:change={onCountryChanged}
                placeholder="Select country"
                class="max-w-[180px]"
            />
            <Button class="space-x-1 font-normal" size="sm" on:click={() => {
                hideModal = false;
                selectedState = null;
            }} outline>
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
                    <th class="w-[130px]">No of Cities</th>
                    <th class="w-[130px]">Status</th>
                    <th class="w-[150px]">Date Created</th>
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
                        <span>{ item.name }</span>
                    </td>
                    <td>
                        <span class="font-medium">{item.cities?.length || 0} Cities</span>
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
                                selectedState = item;
                                hideModal = false;
                            }}
                        >
                            <span><UilEditAlt size="12"/></span>
                            <span>Edit</span>
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
            limit={meta.limit}
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
    {transitionParams}
    activateClickOutside={false}
>
    <StateDrawer 
        data={selectedState}
        on:close={(e) => {
            hideModal = true;
            selectedState = null;
            if (e.detail) {
                getData();
            }
        }}
    />
</Drawer>