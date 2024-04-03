<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from "$lib/client/api";
    import { clickOutside, debounce } from "$lib/utils/helpers";
    import { Avatar, Breadcrumb, BreadcrumbItem, Button, Checkbox, Dropdown, Input } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilAngleDown, UilParcel, UilSearch } from "svelte-unicons";
    import { failure, success } from "$lib/utils/toast";
    import { goto } from "$app/navigation";

    let id, timer,
        isLoading = false,
        searching = false,
        data = [],
        hubs = [],
        users = [],
        items = [];

    onMount(() => {
        getHubs();
    })

    $: checked = items.filter(e => e.checked).length > 0;

    const { form, errors, handleSubmit } = createForm({
        initialValues: {
            hub: { id: "" },
            courier: { id: "" }
        },
        validationSchema: yup.object().shape({
            hub: yup.object().shape({
                id: yup.string().required("You must select a hub").label("Hub"),
            }),
            courier: yup.object().shape({
                id: yup.string().required("You must select a courier").label("Courier"),
            })
        }),
        async onSubmit(values) {
            isLoading = false;

            const body = items.filter(e => e.checked).map(item => {
                return {
                    ...values,
                    package: {
                        id: item.id
                    }
                };
            })
            try {
                // validate number of items
                if (!body.length) {
                    throw "Please select a waybill"
                }

                const res = await clientFetch({
                    path: "/deliveries/bulk",
                    method: "POST",
                    body: {
                        create: body
                    }
                });
                const json = await res.json();
                if (!res.ok) throw json;
                success(json.message);
                goto("/admin/deliveries", {replaceState: true});
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    })

    function getWaybills(e) {
        isLoading = true;
        clientFetch({
            path: "/packages",
            query: {
                search: e.target.value,
                limit: 5
            }
        })
        .then(res => res.json())
        .then(json => {
            data = json.data || [];
        })
        .finally(() => (isLoading = false))
    }

    function getHubs(e) {
        clientFetch({
            path: "/hubs",
            query: {
                search: (typeof e == 'object') ? e.target.value : "",
                limit: 5
            }
        })
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

    function onSelectItem(val) {
        if (!items.find(e => e.id == val.id)) {
            items.push(val);
            items = items;
        }
        data = [];
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

</script>
<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/deliveries">Deliveries</BreadcrumbItem>
        <BreadcrumbItem>Bulk Deliveries</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-3 justify-between items-center mb-3">
        <h2 class="font-bold text-md">Create Bulk Delivery</h2>
        <div class="flex-1 flex justify-end">
            <Button
                disabled={isLoading}    
                on:click={handleSubmit}
            >
                <span class="loading loading-spinner w-3" class:hidden={!isLoading}></span>
                <span>Submit</span>
            </Button>
        </div>
    </div>

    <div class="flex gap-6 mb-10">
        <div>
            <Button
                color="{$errors.hub.id ? 'red' : 'light'}"
                outline
                class="flex gap-4 w-full">
                <Avatar size="md" />
                <div class="flex-1 text-start">
                    <div class="font-normal text-sm">
                        { $form.hub?.name || "Select Hub"}
                    </div>
                    <div class="text-xs text-gray-400">
                        { $form.hub?.code || "Not set" }
                    </div>
                </div>
                <span><UilAngleDown /></span>
            </Button>
            <Dropdown class="p-3">
                <div class="w-full min-w-[250px] py-3">
                    <Input
                        type="text"
                        placeholder="Search hubs..."
                        on:keyup={(e) => (debounce(() => getHubs(e), 400, timer))}
                    >
                        <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                    </Input>
                </div>
                {#each hubs as item }
                    <button 
                        on:click={() => {
                            $form.hub = item;
                            hubs = [];
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
        </div>
        <div>
            <Button
                color="{$errors.courier.id ? 'red' : 'light'}"
                outline
                class="flex gap-3">
                <Avatar size="md" />
                <div class="flex-1 text-start">
                    <div class="font-normal text-sm">
                        { $form.courier?.name || "Select Courier"}
                    </div>
                    <div class="text-xs text-gray-400">
                        { $form.courier?.email || "Not set" }
                    </div>
                </div>
                <span><UilAngleDown /></span>
            </Button>
            <Dropdown class="p-3 min-w-[230px] w-full">
                <div class="w-full min-w-[250px] py-3">
                    <Input
                        type="text"
                        placeholder="Search courier..."
                        on:keyup={(e) => (debounce(() => getUsers(e), 400, timer))}
                    >
                        <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                    </Input>
                </div>
                {#each users as item }
                    <button 
                        on:click={() => {
                            $form.courier = item;
                            users = [];
                        }}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <Avatar size="sm" />
                        <div class="flex-1 text-left text-sm">
                            <div>{ item.name }</div>
                            <div class="text-gray-400 text-xs">
                                { item.email || item.phone || "" }
                            </div>
                        </div>
                    </button>
                    {/each}
            </Dropdown>
        </div>
    </div>

    <div class="w-full overflow-x-auto min-h-[400px]">
        <table class="table custom ">
            <caption>
                <div class="w-full flex flex-col justify-start text-start">
                    <h3 class="font-semibold text-xl px-4">Waybills</h3>
                    <div class="bg-base-100 shadow-sm">
                        <div class="p-4 py-6 flex justify-start">
                            <div class="w-full max-w-xs relative">
                                <Input
                                    bind:value={id}
                                    on:keyup={(e) => (debounce(() => getWaybills(e), 400, timer))}
                                    placeholder="Search waybills">
                                    <span slot="left" class="text-primary-700">
                                        <UilSearch size="20" />
                                    </span>
                                </Input>
                                <div
                                    use:clickOutside={()=> (data=[])}
                                    class="absolute w-full top-12 bg-base-100 shadow-md divide-y rounded-md z-20">
                                    {#each data as item }
                                    <Button
                                        on:click={() => (onSelectItem(item))}
                                        color="none"
                                        class="flex gap-3 w-full justify-start">
                                        <span class="text-base-content/40"><UilParcel /></span>
                                        <div class="flex-1 text-left">
                                            <div class="text-base-content/70">{ item.name }</div>
                                            <div class="text-gray-400 text-xs">{ item.waybill_number }</div>
                                        </div>
                                    </Button>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </caption>
            <thead>
                <tr>
                    <th class="w-[40px]">
                        <Checkbox
                            checked={checked}
                            on:change={(e) => {
                                items = items.map(item => {
                                    item.checked = e.target.checked;
                                    return item;
                                })
                            }} />
                    </th>
                    <th class="w-[160px]">Waybill Number</th>
                    <th>Description</th>
                    <th>Recipient Name</th>
                    <th class="w-[160px]">Recipient Phone</th>
                    <th class="w-[160px]">Status</th>
                </tr>
            </thead>
            <tbody>
            {#each items as item, index (item.id) }
                <tr>
                    <td>
                        <Checkbox 
                            checked={item.checked} 
                            on:change={(e) => {
                                items[index].checked = e.target.checked;
                            }}/>
                    </td>
                    <td>
                        <span>{ item.metadata?.application_id || item.id }</span>
                    </td>
                    <td>
                        <span>{ item.name || "" }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.name }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.phone || "Not set" }</span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ (item.status == "canceled" ? "returned" : item.status) }</span>
                    </td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>