<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from "$lib/client/api";
    import { clickOutside, debounce, formatCurrency } from "$lib/utils/helpers";
    import { failure, neutral, success } from "$lib/utils/toast";
    import dayjs from "dayjs";
    import { Breadcrumb, BreadcrumbItem, Modal, Button, Input, Spinner, Label, Select, Alert } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { UilPackage, UilSearch, UilTrashAlt } from "svelte-unicons";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    const user = $page.data.session.user;
    let items = [];
    let hubs = [];
    let id = "";
    let showModal = false;
    let isLoading = false; 
    let payload = {};
    let pkg;
    let sWaybills = [];

    onMount(() => {
        getHubs();

        if (user.acl.scope == "hub") {
            $form.origin = user.acl.entity_id;
        }
    })

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            origin: "",
            destination: "",
            mode: "road",
            package_ids: []
        },
        validationSchema: yup.object().shape({
            origin: yup.string().required("You must select an origin hub").label("Origin"),
            destination: yup.string().required("You must select a destination hub").label("Destination"),
            mode: yup.string().required().label("Mode"),
            package_ids: yup.array(yup.string().required()).min(1, "You must have at least one waybill").required().label("Waybills"),
        }),
        async onSubmit(values) {

            console.log("Minime");
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/shipments",
                    method: "POST",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;
                
                handleReset();
                success("Shipment created successfully");
                goto("/admin/shipments", {replaceState: true});
                
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    });

    async function getWaybill(e) {
        if (!e.target.value) {
            // neutral("Enter waybill number");
            return;
        }
        isLoading = false;
        try {
            const res = await clientFetch({
                path: "/packages",
                query: {
                    search: e.target.value,
                    limit: 3
                }
            });
            const json = await res.json();
            if (!res.ok) throw json;
            sWaybills = json.data;
            // id = null;
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

    function addWaybill(val) {
        if (!$form.package_ids.includes(val.id)) {
            items = [...items, val];
            $form.package_ids = items.map(e => e.waybill_number);
            id = "";
            sWaybills = [];
        }
    }

    function getHubs() {
        clientFetch({path: "/hubs?limit=100&ignore_acl=true"})
        .then(res => res.json())
        .then(json => (hubs = json.data))
    }

    // TODO: validatee packages
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

    function submit() {
        handleSubmit();
        let errs = Object.values($errors).filter(e => e.length);

        console.log(errs);
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/shipments">Shipments</BreadcrumbItem>
        <BreadcrumbItem>New Manifest</BreadcrumbItem>
    </Breadcrumb>
</div>

<div class="page">
    <div class="flex gap-3 justify-between items-center mb-3">
        <h2 class="font-bold text-md">Generate Manifest</h2>
    </div>

    <form on:submit={handleSubmit}>
        <div class="grid sm:grid-cols-3 gap-x-6 my-8">
            <div>
                <Label class="mb-2">Origin Hub</Label>
                <Select
                bind:value={$form.origin}
                    items={hubs.filter(e => e.id !== $form.destination && (user.acl?.scope == "hub" ? e.id == user.acl.entity_id : true)).map(e => ({value: e.id, name: e.name}))}
                />
            </div>
            <div>
                <Label class="mb-2">Destination Hub</Label>
                <Select
                    bind:value={$form.destination}
                    items={hubs.filter(e => e.id !== $form.origin).map(e => ({value: e.id, name: e.name}))}
                />
            </div>
        </div>
    </form>
    
    <div
        class:hidden={!Object.values($errors).filter(e => e.length).length}
    >
        <Alert color="red">
            {#each Object.values($errors).filter(e => e.length) as err }
            <div class="text-xs py-1">
                <span class="font-medium">Oops!</span>
                <span>{ err }</span>
            </div>
            {/each}
        </Alert>
    </div>

    <div class="flex items-center pb-1 pt-8">
        <div class="flex flex-1 gap-x-4 items-center px-6">
            <div class="w-72 relative">
                <Input 
                    bind:value={id}
                    size="md"
                    placeholder="Search waybill"
                    class="w-72"
                    on:keyup={(e) => (debounce(() => getWaybill(e), 400))}
                >
                    <span slot="left" class="text-primary">
                        <UilSearch size="18" />
                    </span>
                </Input>
                <div
                    use:clickOutside={() => {
                        sWaybills = [];
                    }}
                    class="absolute w-full top-12 bg-base-100 shadow-sm divide-y rounded-md z-20">
                    {#each sWaybills as item }
                    <button
                        on:click={() => (addWaybill(item))}
                        class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                        <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                            <UilPackage size="15" />
                        </div>
                        <div class="flex-1 text-left text-sm">
                            <div>{ item.recipient.name }</div>
                            <div class="text-gray-400 text-xs">{ item.recipient.address }</div>
                        </div>
                    </button>
                    {/each}

                </div>
            </div>
        </div>
    </div>
    <div class="overflow-x-auto w-full pt-6">
        <table class="table table-xs custom table-auto">
            <caption>
                <div class="py-3 px-8 w-full text-start">
                    <h3 class="font-semibold">Waybills</h3>
                    <p class="text-gray-400 text-sm py-2">
                        Generate manifest by adding waybills to your shipment.
                    </p>
                </div>
            </caption>
            <thead>
                <tr>
                    <th>Waybill No.</th>
                    <th class="min-w-[100px]">Name</th>
                    <th class="min-w-[90px]">Quantity</th>
                    <th class="min-w-[100px]">Value</th>
                    <th>Status</th>
                    <th class="min-w-[100px]">Date Created</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each items as item (item.id)}
                <tr>
                    <td>
                        <span>{ item.waybill_number }</span>
                    </td>
                    <td>
                        <span>{ item.name || '' }</span>
                    </td>
                    <td>
                        <span>
                            { item.quantity || 1 }
                        </span>
                    </td>
                    <td>
                        <span>
                            { formatCurrency(item.value)}
                        </span>
                    </td>
                    <td>
                        <span class="{statusStyle(item.status)} text-2xs px-2 py-1 rounded-md uppercase font-medium">{ item.status }</span>
                    </td>
                    <td>
                        <span class="text-xs">{ dayjs(item.created_at).format('DD-MM-YYYY') }</span>
                    </td>
                    <td>
                        <button
                            class="btn btn-xs text-primary bg-primary/5"
                            on:click={() => {
                                items = items.filter(e => e.id != item.id);
                                $form.package_ids = items.map(e => e.id);
                            }}
                        >
                            <UilTrashAlt size="17"/>
                        </button>
                    </td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="mt-6">
        <Button
            disabled={isLoading}
            on:click={handleSubmit}>
            {#if isLoading}
                <Spinner class="mr-3" size="4" />
            {/if}
            Generate Manifest
        </Button>
    </div>

</div>

<Modal title="Waybill #{pkg?.waybill_number}" bind:open={showModal} autoclose>

    <svelte:fragment slot="footer">
        <Button on:click={() => {
            if (items.find) {

            }
        }}>Add</Button>
        <Button color="alternative">Discard</Button>
    </svelte:fragment>
</Modal>