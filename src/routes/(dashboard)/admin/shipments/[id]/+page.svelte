<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { formatCurrency } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { sineIn } from 'svelte/easing';
    import { Breadcrumb, BreadcrumbItem, Button, CloseButton, Drawer, Helper, Label, Select, Spinner } from "flowbite-svelte";
    import { UilEditAlt, UilPrint } from "svelte-unicons";
    import { clientFetch } from "$lib/client/api";
    import { failure, success } from "$lib/utils/toast";
    import ManifestPrint from "$lib/components/dashboard/ManifestPrint.svelte";

    const shipment = $page.data.shipment;

    let hideDrawer = true;
    const modes = ["Road", "Air"];
    let isLoading = false;
    let transitionParams = {
        x: 320,
        duration: 200,
        easing: sineIn
    };

    const statuses = {
        "created": "Shipment created",
        "picked": "Shipment picked",
        "in-transit": "Shipment en-route destination",
        "delivered": "Shipment delivered",
        "delayed": "Shipment experiencing delay",
        "canceled": "Shipment canceled",
        "returned": "Shipment returned"
    }

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            status: shipment.status,
            mode: shipment.mode
        },
        async onSubmit(values) {
            isLoading = true;

            try {
                const res = await clientFetch({
                    path: "/shipments/" + shipment.id,
                    method: "PUT",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;
                hideDrawer = true;
                success("Shipment updated successfully");
                window.location.reload();
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    })


    function statusStyle(val) {
        switch (val) {
            case "created": 
            case "queued": return "bg-slate-100";
            case "in-transit": return "bg-secondary/5 tex-secondary";
            case "delivered": return "bg-success/5 text-success";
            case "returned":
            case "canceled": return "bg-error/5 text-error";
            default: return "bg-slate-200";
        }
    }
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/shipments">Shipments</BreadcrumbItem>
        <BreadcrumbItem>Shipment details</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page print:hidden">
    <div class="flex justify-end items-center gap-4">
        <button 
                class="btn btn-outline btn-primary btn-circle btn-sm" 
                on:click={() => (print())}>
                <UilPrint size="20" />
            </button>
        <Button 
            class="gap-x-2" 
            size="sm"
            on:click={() => (hideDrawer = false)}
            outline>
            <span><UilEditAlt size="15" /></span>
            Update Status
        </Button>
    </div>
    <div class="space-y-2">
        <h3 class="font-medium">Manifest ID: #{shipment.id}</h3>
        <div class="flex items-center gap-x-2 text-sm" style="display:none">
            <span>Status: </span>
            <span class="{statusStyle(shipment.status)} text-xs px-2 py-1 rounded-md uppercase font-medium">{ shipment.status.replace("-", " ") }</span>
        </div>
        <div class="flex items-center gap-x-2 text-sm" style="display:none">
            <span>Transport Mode: </span>
            <span class="{statusStyle("")} text-xs px-2 py-1 rounded-md uppercase font-medium">{ shipment.mode }</span>
        </div>
        <div class="flex items-center gap-x-2 text-sm" style="display:none">
            <div>
                <span>Date created: </span>
                <span class="">{ dayjs(shipment.created_at).format("YYYY-MM-DD") }</span>
            </div>
            <div>
                <span>Last Modified: </span>
                <span class="">{ dayjs(shipment.updated_at).format("YYYY-MM-DD") }</span>
            </div>
        </div>
    </div>

    <div class="mt-6 flex">
        <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
            <span class="text-xs font-medium">DATE:</span>
            <span>{ dayjs(shipment.created_at).format("DD/MM/YYYY hh:mm A") }</span>
        </div>
        <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
            <span class="text-xs font-medium">Last Modified:</span>
            <span>{ dayjs(shipment.updated_at).format("DD/MM/YYYY hh:mm A") }</span>
        </div>
    </div>

    <div class="mt-1 mb-4 grid grid-cols-4 divide-x border">
        <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
            <span class="font-medium">status:</span>
            <span>{ shipment.status }</span>
        </div>
        <div class="flex gap-x-2 text-xs items-center px-3 py-2 uppercase">
            <span class="font-medium">MODE:</span>
            <span>{ shipment.mode }</span>
        </div>
        <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
            <span class="font-medium">ORIGIN:</span>
            <span>{ shipment.origin.name }</span>
        </div>
        <div class="flex gap-x-2  text-xs items-center px-3 py-2 uppercase">
            <span class="text-xs font-medium">DESTINATION:</span>
            <span>{ shipment.destination.name }</span>
        </div>
    </div>

    <div class="hidden gap-6 flex-wrap py-5">
    {#each [shipment.origin, shipment.destination] as item, index }
        <div class="w-full max-w-[200px] shadow-sm rounded-md bg-base-100 p-4 space-y-2 relative">
            <h4 class="uppercase text-xs font-medium">{ index == 0 ? "Origin" : "Destination" } Hub</h4>
            <div class="absolute -top-1 right-1">
                <span class="px-3 py-1 rounded-md bg-slate-50 text-xs font-medium">{item.code}</span>
            </div>
            <div class="py-1 text-sm">{ item.name }</div>
        </div>
    {/each}
    </div>

    <div class="overflow-x-auto w-full mt-4">
        <table class="table table-xs custom table-auto">
            <caption>
                <div class="py-3 px-8 w-full text-start">
                    <h3 class="font-semibold">Waybills</h3>
                    <p class="text-gray-400 text-sm"></p>
                </div>
            </caption>
            <thead>
                <tr>
                    <th>Application ID</th>
                    <th>NIN</th>
                    <th class="min-w-[150px]">Reciever</th>
                    <th class="min-w-[100px]">Date Created</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each shipment.packages as item (item.id)}
                <tr>
                    <td>
                        <span>{ item.application_id }</span>
                    </td>

                    <td>
                        <span>{ item.nin }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.name || '' }</span>
                    </td>
                    
                   
                    <td>
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                    <td>
                        <button
                            class="btn btn-xs text-primary bg-primary/5"
                            on:click={() => {
                                goto("/admin/waybills/" + item.id)
                            }}
                        >
                            <span>View</span>
                        </button>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<ManifestPrint items={[shipment]} class="hidden print:block" />

<Drawer
    bind:hidden={hideDrawer} 
    placement="right" 
    transitionType="fly"
    {transitionParams}
    activateClickOutside={false}
>
    <div>
        <div class="flex justify-end items-center mb-4">
            <h3 class="text-sm font-semibold">Update Shipment</h3>
            <CloseButton on:click={() => (hideDrawer = true)} />
        </div>
        <form on:submit={handleSubmit}>
            <div class="form-control">
                <Label for="name" class="mb-2 font-normal">Status</Label>
                <Select 
                    size="sm"
                    bind:value={$form.status}
                    items={Object.entries(statuses).map(e => ({value: e[0], name: e[1]}))}
                    placeholder="Select Status"
                    class="w-full"
                />
                {#if $errors.code }
                <Helper color="red" class="mt-2">
                    <strong>Oops! </strong>
                    <span>{ $errors.code }</span>
                </Helper>
                {/if}
            </div>
            <div class="form-control">
                <Label for="name" class="mb-2 font-normal">Mode</Label>
                <Select 
                    size="sm"
                    bind:value={$form.mode}
                    items={modes.map(e => ({value: e.toLowerCase(), name: e}))}
                    placeholder="Select Mode"
                    class="w-full"
                />
                {#if $errors.mode }
                <Helper color="red" class="mt-2">
                    <strong>Oops! </strong>
                    <span>{ $errors.mode }</span>
                </Helper>
                {/if}
            </div>
            <div class="mt-5">
                <Button type="submit" disabled={isLoading}>
                    {#if isLoading}
                        <Spinner class="mr-3" size="4" />
                    {/if}
                    Submit
                </Button>
            </div>
        </form>
    </div>
</Drawer>