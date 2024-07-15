<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { formatCurrency } from "$lib/utils/helpers";
    import dayjs from "dayjs";
    import { sineIn } from 'svelte/easing';
    import { Breadcrumb, BreadcrumbItem, Button, CloseButton, Drawer, Helper, Label, Select, Spinner , Modal} from "flowbite-svelte";
    import { UilEditAlt, UilPrint, UilCar, UilPackage } from "svelte-unicons";
    import { clientFetch } from "$lib/client/api";
    import BulkDeliveryAssign from "$lib/components/dashboard/admin/BulkDeliveryAssign.svelte";
    import { failure, info, success } from "$lib/utils/toast";
    import ManifestPrint from "$lib/components/dashboard/ManifestPrint.svelte";
    import { onMount } from "svelte";
    import { debounce } from "$lib/utils/helpers";
    let shipment = {package_ids:[]};

    let showDelivery = false;
    let hideDrawer = true;
    const modes = ["Road", "Air"];
    let isLoading = true;
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
                if(res.ok){
                    hideDrawer = true;
                success("Shipment updated successfully");
                window.location.reload();
                }
               
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

    const print = (fileUrl) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        } else {
            failure("No file URL available");
        }
    }

    const upload = (id) => {
        // Trigger the file input click event
        document.getElementById('file-input-' + id).click();
    }

    const recievePackages =()=>{
        info("updating waybills...")
        const body = {
            update: shipment.package_ids,
        };
        clientFetch({
            path: "/packages/generate",
            method: "PUT",
            body,
        })
            .then((res) => res.json())
            .then((json) => {
                if (!json.data) {
                    failure(json.data);
                    return;
                } else {
                    getData();
                    success("Shipment updated successfully");
                   // window.location.reload();
                }
                

            })
            .catch((e) => {
                failure(e);
            })
            
    }

    const handleFileChange = async (event, id) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            try {
                isLoading = true;
                const formData = new FormData();
                formData.append("file", file);

                const res = await clientFetch({
                    path: `/shipments/${id}/upload`,
                    method: "POST",
                    body: formData
                });
                const json = await res.json();
                if (!res.ok) throw json;
                success("File uploaded successfully");
                window.location.reload();
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        } else {
            failure("Please select a PDF file");
        }
    }

    const getData = async () => {
        const path = location.pathname.split('/');
        const id = path[path.length - 1];
        console.log(id);

        try {
            const res = await clientFetch({
                path: `/shipments/${id}`
            });
            const json = await res.json();
            shipment = json.data;
            console.log('item', shipment);
        } catch (error) {

        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        getData()
    })
</script>

<div class="gwx-breadcrumb print:hidden">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/international">International</BreadcrumbItem>
        <BreadcrumbItem>Shipment details</BreadcrumbItem>
    </Breadcrumb>
</div>

{#if !isLoading}
<div class="page print:hidden">
    <div class="flex justify-end items-center gap-4">
        <button
        class="btn btn-outline btn-primary btn-circle btn-sm"
        on:click={() => (print(shipment.file_url))}>
        <UilPrint size="20" />
    </button>
      {#if shipment.packages[0].status == 'draft' || shipment.packages[0].status == 'new'}
      <button
      title="Update to waybill generated"
          class="btn btn-outline btn-primary btn-circle btn-sm"
          on:click={() => (recievePackages())}>
          <UilPackage size="20" />
      </button>
      {/if}
      {#if shipment.packages[0].status == 'waybill-generated'}
      <button
      title="assign to rider"
          class="btn btn-outline btn-primary btn-circle btn-sm"
          on:click={() => (showDelivery = true)}>
          <UilCar size="20" />
      </button>
      {/if}
    </div>
    <div class="space-y-2">
        <h3 class="font-medium">Shipment ID: #{shipment.id}</h3>
        <!-- <div class="flex items-center gap-x-2 text-sm" style="display:none">
            <span>Status: </span>
            <span class="{statusStyle(shipment.status)} text-xs px-2 py-1 rounded-md uppercase font-medium">{ shipment.status.replace("-", " ") }</span>
        </div> -->
        <!-- <div class="flex items-center gap-x-2 text-sm" style="display:none">
            <span>Transport Mode: </span>
            <span class="{statusStyle("")} text-xs px-2 py-1 rounded-md uppercase font-medium">{ shipment.mode }</span>
        </div> -->
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
        <div class="flex gap-x-2 text-xs items-center px-3 py-2 uppercase">
            <span class="text-xs font-medium">DATE:</span>
            <span>{ dayjs(shipment.created_at).format("DD/MM/YYYY hh:mm A") }</span>
        </div>
        <div class="flex gap-x-2 text-xs items-center px-3 py-2 uppercase">
            <span class="text-xs font-medium">Last Modified:</span>
            <span>{ dayjs(shipment.updated_at).format("DD/MM/YYYY hh:mm A") }</span>
        </div>
    </div>

    <div class="mt-1 mb-4 grid grid-cols-4 divide-x border">
        <div class="flex gap-x-2 text-xs items-center px-3 py-2 uppercase">
            <span class="font-medium">status:</span>
            <span>{ shipment.status }</span>
        </div>
        <!-- <div class="flex gap-x-2 text-xs items-center px-3 py-2 uppercase">
            <span class="font-medium">MODE:</span>
            <span>{ shipment.mode }</span>
        </div> -->
    </div>

    <div class="overflow-x-auto w-full mt-4">
        <table class="table table-xs custom table-auto table-responsive">
            <caption>
                <div class="py-3 px-8 w-full text-start">
                    <h3 class="font-semibold">Passports</h3>
                    <p class="text-gray-400 text-sm"></p>
                </div>
            </caption>
            <thead>
                <tr>
                    <th>NIN </th>
                    <th class="min-w-[90px]">Reciepent</th>
                    <th class="min-w-[120px]">Address</th>
                    <th>Postal Code</th>
                    <th class="min-w-[100px]">Country</th>
                    <th class="min-w-[100px]">State</th>
                    <th>Email</th>
                    <th class="min-w-[130px]">Status</th>
                    <th class="min-w-[100px]">Date Created</th>
                    <th class="min-w-[150px]"></th>
                </tr>
            </thead>
            <tbody>
                {#each shipment.packages as item (item.id)}
                <tr>
                    <td>
                        <span>{ item.nin }</span>
                    </td>
                    <td>
                        <span>{ item.recipient.name || '' }</span>
                    </td>
                    <td>
                        <span>
                            { item.recipient.address }
                        </span>
                    </td>
                    <td>
                        <span>
                            {item.recipient.postal_code}
                        </span>
                    </td>
                    <td>
                        <span>
                            {item.recipient.state.name}
                        </span>
                    </td>
                    <td>
                        <span>
                            {item.recipient.country.name}
                        </span>
                    </td>
                    <td>
                        <span>
                            {item.recipient.email}
                        </span>
                    </td>
                    <td class="min-w-[90px]">
                        <span
                        class="{statusStyle(
                            item.status,
                        )} text-2xs px-2 py-1 rounded-md uppercase font-medium"
                        >{(item.status)}</span
                    >
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
                        {#if item.file_url}
                        <button
                            class="btn btn-xs text-blue bg-blue/5"
                            on:click={() => {
                                print(item.file_url)
                            }}
                        >
                            <span>Print</span>
                        </button>

                        {:else if item.recipient.country.code == 'US'}
                        <button
                        class="btn btn-xs text-yellow bg-yellow/5"
                        on:click={() => {
                            upload(item.id)
                        }}
                    >
                        <span>Upload PDF</span>
                    </button>
                        {/if}
                        <input
                            type="file"
                            id="file-input-{item.id}"
                            class="hidden"
                            accept="application/pdf"
                            on:change={(event) => handleFileChange(event, item.id)}
                        />
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
{/if}

<!-- <ManifestPrint items={[shipment]} class="hidden print:block" />

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
                    items={Object.entries(statuses).map(e => ({ value: e[0], name: e[1] }))}
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
                    items={modes.map(e => ({ value: e.toLowerCase(), name: e }))}
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
</Drawer> -->
<Modal
    title="Assign Delivery ({shipment.package_ids.length})"
    bind:open={showDelivery}
    autoclose={false}
    size="xs"
    class="w-full"
>
    <BulkDeliveryAssign
    
        class="print:hidden"
        items={shipment.package_ids}
        on:close={() => (showDelivery = false)}
        on:done={() => {
            showDelivery = false;
           // location.reload();
        }}
    />
</Modal>