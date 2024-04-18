<script>
    import { page } from "$app/stores";
    import { clientFetch } from "$lib/client/api";
    import { debounce } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { Button, CloseButton, Label, Select, Input, Avatar, Dropdown } from "flowbite-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { UilAngleDown, UilSearch, UilSitemap } from "svelte-unicons";

    export let data = {
        status: "",
        tag: "nis-application"
    }

    const dispatch = createEventDispatcher();

    let user = $page.data.session.user;
    let name, hubName, hub;
    let hubs = [];
    const statuses = {
        "": "All",
        "draft": "Draft",
        "new": "New",
        "out-for-delivery": "Out for delivery",
        "delivered": "Delivered",
        "canceled": "Canceled",
        "returned": "returned"
    }

    onMount(() => {
        if (data.hub_id) {
            findHubs();
        }
    })

    function findHubs(e) {
        clientFetch({
            path: "/hubs",
            query: {
                ids: hubName ? '' : (data.hub_id || ''),
                search: e ? e.target.value : '',
            }
        })
        .then(res => res.json())
        .then(json => {
            if (json.data) {
                hubs = json.data;
                if (data.hub_id) {
                    hub = hubs.find(e => e.id == data.hub_id)
                }
            }
            
        });
    }
</script>

<div>
    <div class="flex justify-between items-center pb-6">
        <h3 class="font-medium pt-2">Filter Applications</h3>
        <CloseButton on:click={() => (dispatch('close'))} />
    </div>

    <div class="form-control">
        <Label for="status" class="mb-1 font-normal">Status</Label>
        <Select
            id="status"
            bind:value={data.status}
            placeholder="Select status"
            items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
        />
    </div>
    <div 
        class="form-control"
        class:hidden={["customer"].includes(user.role)}>
        <Label for="role" class="mb-1 font-normal justify-between flex items-center">
            <span>Select Hub</span>
            <button
                class="text-primary text-xs font-medium bg-primary-100 px-2 py-1 rounded-md" 
                on:click={(e) => {
                data.hub_id = '';
                hub = null;
                hubs = [];
            }}>
                Clear
            </button>
        </Label>
        <div>
            <Button color="alternative" size="sm" class="space-x-1 justify-between w-full gap-x-2">
                <div class="w-8 h-8 rounded-full bg-slate-50 grid place-content-center text-gray-400">
                    <UilSitemap size="16" />
                </div>
                <div class="flex-1 text-start font-normal">
                    <span>{ hub?.name || "Select hub"}</span>
                </div>
                <span><UilAngleDown size="18"/> </span>
            </Button>
            <Dropdown containerClass="w-full z-50">
                <div class="w-full relative bg-base-100 p-4 py-2">
                    <Input
                        bind:value={name}
                        placeholder="Search hubs"
                        class="input input-md input-bordered rounded-lg placeholder:text-sm w-full pl-8 h-10"
                        size="xs"
                        on:keyup={(e) => (debounce(() => findHubs(e), 400))}
                    >
                        <span slot="left" class="text-primary"><UilSearch size="16" /></span>
                    </Input>
                    <div
                        class="w-full divide-y rounded-md py-2">
                        {#each hubs as item }
                        <button 
                            on:click={() => {
                                hub = item;
                                data.hub_id = item.id;
                                name = null;
                                hubs = [];
                            }}
                            class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                            <Avatar size="sm" />
                            <div class="flex-1 text-left text-sm">
                                <div>{ item.name }</div>
                                <div class="text-gray-400 text-xs">{ item.code || item.id || "" }</div>
                            </div>
                        </button>
                        {/each}
                    </div>
                </div>
            </Dropdown>
        </div>
    </div>
    <div class="form-control">
        <Label for="status" class="mb-1 font-normal">Start date</Label>
        <Input
            type="date"
            bind:value={data.date_min}
            on:change={(e) => (data.date_min = e.target.value)}
        />
    </div>
    <div class="form-control">
        <Label for="status" class="mb-1 font-normal">End date</Label>
        <Input
            type="date"
            bind:value={data.date_max}
            min="{data.date_min ? dayjs(data.date_min).format('YYYY-MM-DD') : ''}"
            on:change={(e) => (data.date_max = e.target.value)}
        />
    </div>
    <div class="form-control mt-4">
        <Button on:click={() => (dispatch('data', data))}>
            Submit
        </Button>
    </div>
</div>