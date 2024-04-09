<script>
    import { debounce, getJSON } from "$lib/utils/helpers";
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { Button, Dropdown, DropdownItem, Label, Modal, Input, Helper, Avatar, Alert } from "flowbite-svelte";
    import { UilAngleDown, UilSearch, UilTruck, UilUser } from "svelte-unicons";
    import { AddCircle, Compass, InformationCircle } from 'svelte-ionicons'
    import { clientFetch } from "$lib/client/api";
    import { closeModal, showModal } from "$lib/stores/app";
    import { failure, success } from "$lib/utils/toast";
    import { computeStatus } from "$lib/client/helpers";

    export let item;
    console.log("the items here", item);

    let hubs = [];
    let users = [];
    let formModal = false;

    let allowedStatuses = ["en-route", "pending"];

    const { form, errors, handleSubmit, handleReset } = createForm({
        initialValues: {
            package: { id: item.id },
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
            showModal()
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
                formModal = false;

                // reload page
                location.reload();
            } catch (error) {
                failure(error);
            } finally {
                closeModal();
            }
        }
    })

    function getHubs(e) {
        clientFetch({
            path: "/hubs",
            query: {
                limit: 5,
                search: e?.target?.value
            }
        })
        .then(res => res.json())
        .then(json => {
            hubs = json.data || [];
        })
    }

    function getUsers(e) {
        clientFetch({
            path: "/users",
            query: {
                limit: 5,
                role: "courier,rider",
                search: e?.target?.value,
                full: true
            }
        })
        .then(res => res.json())
        .then(json => {
            users = json.data || [];
        })
    }

    function statusStyle(val) {
        switch (val) {
            case "pending": return "bg-info/10 text-info";
            case "en-route": return "bg-info/10 text-info";
            case "completed": return "bg-success/10 text-success";
            case "returned":
            case "canceled": return "bg-error/10 text-error";
            default: return "text-base-content/80";
        }
    }
</script>

<div 
    class="bg-base-100 rounded-lg shadow-sm p-4 relative overflow-hidden z-0" 
    class:hidden={!item}>
    
    {#if (item.delivery)}
        <a href="/admin/deliveries/{item.delivery.id}" class="w-10 h-10 bg-primary/5 rounded-full grid place-content-center mb-4 text-primary">
            <UilTruck size="18" />
        </a>
        <div class="flex items-center gap-3">
            <span class="grid place-content-center w-9 h-9 rounded-full border bg-slate-100 text-slate-400">
                <Compass size="20" />
            </span>
            <div class="flex-1 flex flex-col py-2">
                <span class="text-xs text-base-content/50 uppercase">Delivery Hub</span>
                <div class="text-sm">{ getJSON(item.delivery.hub).name }</div>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <span class="grid place-content-center w-9 h-9 rounded-full border bg-slate-100 text-slate-400">
                <UilUser size="15" />
            </span>
            <div class="flex-1 flex flex-col py-2">
                <span class="text-xs text-base-content/50 uppercase">Courier</span>
                <div class="text-sm">{ getJSON(item.delivery.courier).name }</div>
            </div>
        </div>
        {#if item.delivery?.assigner}
        <div class="p-2 bg-slate-50 rounded-lg border border-slate-100 mt-1">
            <div class="text-2xs text-base-content/50 uppercase -mt-1">Assigned By</div>
            <div class="text-xs text-base-content/80">{ item.delivery.assigner.name }</div>
        </div>
        {/if}
    
        <div class="absolute top-6 right-3">
            <span class="{statusStyle(item.delivery.status)} text-xs px-2 py-1 rounded-md uppercase">
                { computeStatus(item.delivery.status) }
            </span>
        </div>
    {/if}
    
   {#if !item.delivery || item.delivery.status != 'delivered'}
    <div 
        class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center"
        class:hidden={allowedStatuses.includes(item?.delivery?.status)}>
        <Button
            color="none"
            class="flex flex-col text-white gap-y-2"
            on:click={() => (formModal = true)}>
            <span><AddCircle size="35"/></span>
            <span>Assign Delivery</span>
        </Button>
    </div>
    {/if}
</div>

<Modal
    bind:open={formModal}
    size="xs"
    autoclose={false}
    class="w-full">
    <form on:submit={handleSubmit} class="min-h-[300px]">
        <h3 class="font-medium text-md mb-8">Assign Delivery </h3>
        <div
            class="mb-4"
            class:hidden={![$errors.hub.id, $errors.courier.id].filter(e => !!e).find(e => !!e)}>
            <Alert color="red">
                <InformationCircle slot="icon" size="23" />
                <span class="font-medium">Default alert!</span>
                { [$errors.hub.id, $errors.courier.id].filter(e => !!e).find(e => !!e) }
             </Alert>
        </div>
        <div class="w-full form-control">
            <Label class="mb-2">Delivery Origin Hub:</Label>
            <Button 
                color="light"
                outline 
                class="flex gap-3 border w-full {$errors.courier.id ? 'border-red-400' : 'none'}">
                <div class="flex-1 text-start">
                    <div class="font-normal text-sm">{ $form.hub?.name || "Select a hub"}</div>
                    <div class="text-xs text-gray-400">{ $form.hub?.code || "Not set" }</div>
                </div>
                <span><UilAngleDown /></span>
            </Button>
            <Dropdown class="p-3 min-w-[300px]">
                <div slot="header" class="py-2 px-4">
                    <Input
                        type="text"
                        placeholder="Search hubs..."
                        on:keyup={(e) => (debounce(() => getHubs(e), 400))}
                        class="w-full"
                    >
                        <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                    </Input>
                </div>
                {#each hubs as item }
                <DropdownItem
                    on:click={() => {
                        $form.hub = item;
                        hubs = [];
                    }}
                    class="flex">
                    <div class="font-normal">
                        <div class="text-gray-400 text-2xs">{ item.code || "" }</div>
                        <h4>{ item.name }</h4>
                    </div>
                </DropdownItem>
                {/each}
            </Dropdown>
            {#if $errors.hub.id}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.hub.id }
            </Helper>
            {/if}
        </div>
        <div class="w-full form-control">
            <Label class="mb-2">Courier:</Label>
            <Button
                color="light"
                outline 
                class="flex gap-3 border w-full {$errors.courier.id ? 'border-red-400' : 'none'}">
                <Avatar size="sm" />
                <div class="flex-1 text-start">
                    <div class="font-normal text-sm">{ $form.courier?.name || "Select a rider"}</div>
                    <div class="text-xs text-gray-400">{ $form.courier?.email || "Not set" }</div>
                </div>
                <span><UilAngleDown /></span>
            </Button>
            <Dropdown class="p-3 min-w-[300px]">
                <div slot="header" class="py-2 px-4">
                    <Input
                        type="text"
                        placeholder="Search hubs..."
                        on:keyup={(e) => (debounce(() => getUsers(e), 400))}
                        class="w-full"
                    >
                        <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                    </Input>
                </div>
                {#each users as item }
                <DropdownItem
                    on:click={() => {
                        $form.courier = item;
                        users = [];
                    }}
                    class="flex">
                    <div class="font-normal">
                        <div class="text-gray-400 text-2xs">{ item.email || "" }</div>
                        <h4>{ item.name }</h4>
                    </div>
                </DropdownItem>
                {/each}
            </Dropdown>
            {#if $errors.hub.id}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.hub.id }
            </Helper>
            {/if}
        </div>
        <div class="form-control w-full flex flex-row gap-2 justify-end items-center pt-8">
            <Button 
                color="alternative" 
                class="bg-slate-100"
                on:click={() => (formModal = false)}>
                Cancel
            </Button>
            <Button type="submit">Submit</Button>
        </div>
    </form>
</Modal>