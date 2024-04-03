<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from "$lib/client/api";
    import { slide } from 'svelte/transition';
    import { quintInOut } from 'svelte/easing';
    import { failure, neutral, success } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import { Breadcrumb, BreadcrumbItem, Modal, Button, Input, Spinner, Label, Select, Alert, Avatar, Helper, Dropdown } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilAngleDown, UilParcel, UilSearch, UilTrashAlt, UilUser } from "svelte-unicons";
    import { goto } from "$app/navigation";
    import { clickOutside, debounce } from "$lib/utils/helpers";
    import { page } from "$app/stores";

    const user = $page.data.session.user;

    let hubs = [];
    let users = [];
    let items = [];
    let name = "";
    let id = "";
    let isLoading, searching = false; 
    let pkg, courier;

    onMount(() => {
        getHubs();

        if (user.acl?.scope == "hub") {
            $form.hub.id = user.acl?.entity_id;
        }
    })

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            package: { id: "" },
            hub: { id: "" },
            courier: { id: "" }
        },
        validationSchema: yup.object().shape({
            package: yup.object().shape({
                id: yup.string().required("You must select a waybill").label("Waybill"),
            }),
            hub: yup.object().shape({
                id: yup.string().required("You must select a hub").label("Hub"),
            }),
            courier: yup.object().shape({
                id: yup.string().required("You must select a courier").label("Courier"),
            })
        }),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/deliveries",
                    method: "POST",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;
                handleReset();
                success("Delivery created successfully");
                goto("/admin/deliveries", {replaceState: true});
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    });

    async function getWaybills(e) {
        isLoading = false;
        try {
            const res = await clientFetch({
                path: "/packages",
                query: {
                    search: e.target.value,
                    limit: 6,
                }
            });
            const json = await res.json();
            if (!res.ok) throw json;
            items = json.data; 
            // pkg = json.data;
            // $form.package.id = pkg.id;
            // id = pkg.id;
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

    function onSelectItem(val) {
        pkg = val;
        $form.package.id = val.id;
        id = null;
        items = [];
    }

    function getHubs(e) {
        clientFetch({path: "/hubs?limit=50"})
        .then(res => res.json())
        .then(json => (hubs = json.data))
    }

    async function getUsers(e) {
        searching = true;
        try {
            const res = await clientFetch({
                path: "/users",
                query: {
                    limit: 5,
                    role: "courier,rider",
                    search: e.target.value,
                    full: true
                }
            });
            const json = await res.json();
            if (!res.ok) throw json;
            users = json.data; 
        } catch {

        } finally {
            searching = false;
        }
    }

    function onSelectUser(user) {
        $form.courier.id = user.id;
        courier = user;
        name = user.name;
        users = [];
    }

    function submit() {
        if (!$form.courier.id) {
            failure("You must select a courier");
            return;
        }

        if (!$form.package.id) {
            failure("You must select a waybill");
            return;
        }

        handleSubmit();
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/deliveries">Deliveries</BreadcrumbItem>
        <BreadcrumbItem>Create Delivery</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-3 justify-between items-center mb-3">
        <h2 class="font-bold text-md">Create New Delivery</h2>
        <div class="flex-1 flex justify-end">
            <Button
                disabled={isLoading}    
                on:click={submit}
            >
                <span class="loading loading-spinner w-3" class:hidden={!isLoading}></span>
                <span>Submit</span>
            </Button>
        </div>
    </div>

    <div class="max-w-xl w-full">
        <div class="grid grid-cols-2 gap-6">
            <div class="w-full">
                <Label class="mb-2">Delivery Hub</Label>
                <Button color="{$errors.hub.id ? 'red' : 'none'}" outline class="flex gap-3 border border-gray-300 w-full">
                    <Avatar size="md" />
                    <div class="flex-1 text-start">
                        <div class="font-normal text-sm">{ $form.hub?.name || "Select a hub"}</div>
                        <div class="text-xs text-gray-400">{ $form.hub?.code || "Not set" }</div>
                    </div>
                    <span><UilAngleDown /></span>
                </Button>
                <Dropdown class="p-3">
                    <div class="w-full min-w-[250px] py-3">
                        <Input
                            type="text"
                            placeholder="Search hubs..."
                            on:keyup={(e) => (debounce(() => getHubs(e), 400))}
                        >
                            <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                        </Input>
                    </div>
                    {#each hubs as item }
                    <button 
                        on:click={() => {
                            $form.hub = item;
                            // users = [];
                        }}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <Avatar size="sm" />
                        <div class="flex-1 text-left text-sm">
                            <div>{ item.name }</div>
                            <div class="text-gray-400 text-xs">{ item.code || "" }</div>
                        </div>
                    </button>
                    {/each}
                </Dropdown>
                {#if $errors.hub.id}
                <Helper class="mt-2" color="red">
                    <span class="font-medium">Oh, snapp! </span>
                    { $errors.hub.id }
                </Helper>
                {/if}
            </div>
            <div class="w-full">
                <Label class="mb-2">Courier:</Label>
                <Button color="{$errors.courier.id ? 'red' : 'none'}" outline class="flex gap-3 border border-gray-300 w-full">
                    <Avatar size="md" />
                    <div class="flex-1 text-start">
                        <div class="font-normal text-sm">{ $form.courier?.name || "Select a courier"}</div>
                        <div class="text-xs text-gray-400">{ $form.courier?.email || "Not set" }</div>
                    </div>
                    <span><UilAngleDown /></span>
                </Button>
                <Dropdown class="p-3 min-w-[230px] w-full">
                    <div class="w-full min-w-[250px] py-3">
                        <Input
                            type="text"
                            placeholder="Search user..."
                            on:keyup={(e) => (debounce(() => getUsers(e), 400))}
                        >
                            <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                        </Input>
                    </div>
                    {#each users as item }
                    <button 
                        on:click={() => {
                            $form.courier = item;
                            // users = [];
                        }}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <Avatar size="sm" />
                        <div class="flex-1 text-left text-sm">
                            <div>{ item.name }</div>
                            <div class="text-gray-400 text-xs">{ item.email || item.phone || "" }</div>
                        </div>
                    </button>
                    {/each}
                </Dropdown>
                {#if $errors.courier.id}
                <Helper class="mt-2" color="red">
                    <span class="font-medium">Oh, snapp! </span>
                    { $errors.courier.id }
                </Helper>
                {/if}
            </div>
        </div>
        <div class="form-control hidden">
            <div>
                <Label class="mb-2">Delivery Hub</Label>
                <Select
                    bind:value={$form.hub.id}
                    items={hubs.filter(e => e.id !== $form.origin).map(e => ({value: e.id, name: e.name}))}
                />
                {#if $errors.hub.id}
                <Helper class="mt-2" color="red">
                    <span class="font-medium">Oh, snapp! </span>
                    { $errors.hub.id }
                </Helper>
                {/if}
            </div>
        </div>
    </div>

    <div class="flex my-8 rounded-lg shadow-sm min-h-[400px]">
        <div class="flex-none w-72 p-4 py-6 bg-[#f5f5f5] hidden">
            <div class="text-gray-500 text-sm pb-2">Select a courier</div>
            <div class="w-full relative">
                <Input
                    bind:value={name}
                    on:keyup={(e) => (debounce(() => getUsers(e), 400))}
                    placeholder="Search couriers">
                    <span slot="left" class="text-primary-700">
                        <UilSearch size="20" />
                    </span>
                </Input>
                <div
                    use:clickOutside={() => {
                        users = [];
                    }} 
                    class="absolute w-full top-12 bg-base-100 shadow-md divide-y rounded-md z-20">
                    {#each users as user }
                    <button 
                        on:click={() => (onSelectUser(user))}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                            <UilUser size="15" />
                        </div>
                        <div class="flex-1 text-left text-sm">
                            <div>{ user.name }</div>
                            <div class="text-gray-400 text-xs">{ user.email || user.phone || "" }</div>
                        </div>
                    </button>
                    {/each}
                </div>
            </div>
            {#if courier}
            <div transition:slide={{delay: 100, duration: 500, easing: quintInOut, axis: 'y'}} class="bg-base-100 flex shadow-sm gap-4 p-4 mt-4">
                <Avatar />
                <div class="text-sm">
                    <div>{ courier.name }</div>
                    <div class="text-gray-400">{ courier.email || courier.phone || "Not set" }</div>
                </div>
            </div>

            {/if}
        </div>

        <div class="bg-base-100 shadow-sm flex-1 divide-y min-h-[300px]">
            <div class="p-4 py-6 flex justify-start">
                <div class="w-full max-w-xs relative">
                    <Input
                        bind:value={id}
                        on:keyup={(e) => (debounce(() => getWaybills(e), 400))}
                        placeholder="Search waybills">
                        <span slot="left" class="text-primary-700">
                            <UilSearch size="20" />
                        </span>
                    </Input>
                    <div
                        use:clickOutside={() => {
                            items = [];
                        }} 
                        class="absolute w-full top-12 bg-base-100 shadow-md divide-y rounded-md z-20">
                        {#each items as item }
                        <button 
                            on:click={() => (onSelectItem(item))}
                            class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                            <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                                <UilParcel size="15" />
                            </div>
                            <div class="flex-1 text-left text-sm">
                                <div>{ item.name }</div>
                                <div class="text-gray-400 text-xs">{ item.waybill_number || "" }</div>
                            </div>
                        </button>
                        {/each}
                    </div>
                </div>
            </div>
            {#if pkg}
            <div class="bg-base-100 rounded-sm shadow-sm mt-4">
                <div class="p-8" id="pdf">
                    <div class="w-full flex justify-between">
                        <div>
                            <span class="text-xs text-base-content/50 uppercase">Date created</span>
                            <div class="text-xs text-base-content/80">{ dayjs(pkg?.created_at).format("DD-MM-YYYY")}</div>
                        </div>
                    </div>
                    <div class="flex-none grid place-content-center bg-accent/5 rounded-full w-11 h-11 mt-8">
                        <UilParcel size="20"/>
                    </div>
                    <h3 class="font-medium pb-6 uppercase mt-4">Package Details</h3>
            
                    <div class="grid mb-8">
                        <div class="info-item">
                            <span class="title">Description</span>
                            <div class="content">
                                <span class:fade={!pkg.name} >{ pkg.name || "Not set" }</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="title">Value</span>
                            <div class="content">
                                <span class:fade={!pkg.value} >{ pkg.value || "Not set" }</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="title">Weight (KG)</span>
                            <div class="content">
                                <span class:fade={!pkg.weight} >{ pkg.weight || "Not set" }</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="title">Dimensions</span>
                            <div class="content">
                                <div class="flex gap-x-2">
                                    <span>{ pkg.dimensions?.width || "0" }W</span>
                                    <span>{ pkg.dimensions?.height || "0" }H</span>
                                    <span>{ pkg.dimensions?.length || "0" }L</span>
                                </div>
                            </div>
                        </div>
                    </div>
            
                    <div class="grid gap-8 md:grid-cols-2">
                        <div class="py-5">
                            <h3 class="mb-4 uppercase font-medium">Sender</h3>
                            <div class="info-item">
                                <span class="title">Name</span>
                                <div class="content">
                                    <span class:fade={!pkg.sender.name} >{ pkg.sender.name || "Not set" }</span>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="title">Email</span>
                                <div class="content">
                                    <span class:fade={!pkg.sender.email} >{ pkg.sender.email || "Not set" }</span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <span class="title">Phone</span>
                                <div class="content">
                                    <span class:fade={!pkg.sender.phone} >{ pkg.sender.phone || "Not set" }</span>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="title">Address</span>
                                <div class="content">
                                    <span class:fade={!pkg.sender.address} >{ pkg.sender.address || "Not set" }</span>
                                </div>
                            </div>
                        </div>
                        <div class="py-5">
                            <h3 class="mb-4 uppercase font-medium">Recipient</h3>
                            <div class="info-item">
                                <span class="title">Name</span>
                                <div class="content">
                                    <span class:fade={!pkg.recipient.name} >{ pkg.recipient.name || "Not set" }</span>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="title">Email</span>
                                <div class="content">
                                    <span class:fade={!pkg.recipient.email} >{ pkg.recipient.email || "Not set" }</span>
                                </div>
                            </div>
                            
                            <div class="info-item">
                                <span class="title">Phone</span>
                                <div class="content">
                                    <span class:fade={!pkg.recipient.phone} >{ pkg.recipient.phone || "Not set" }</span>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="title">Address</span>
                                <div class="content">
                                    <span class:fade={!pkg.recipient.address} >{ pkg.recipient.address || "Not set" }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/if}
           
        </div>
    </div>
</div>

<style lang="postcss" scoped>
    .info-item {
        @apply flex py-2 border-b border-b-slate-50;
    }
    .info-item .title {
        @apply flex-none w-28 sm:w-20 md:w-28 text-xs uppercase text-base-content/60 pt-1;
    }
    .info-item .content {
        @apply text-sm flex flex-col items-start text-base-content/75 gap-y-2;
    }
    .info-item .content .fade {
        @apply text-base-content/40 italic;
    }
</style>