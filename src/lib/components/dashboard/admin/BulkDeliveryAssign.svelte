<script>
    import * as yup from "yup";
    import { clientFetch } from "$lib/client/api";
    import { debounce } from "$lib/utils/helpers";
    import { Alert, Avatar, Button, Dropdown, DropdownItem, Helper, Input, Label, Search } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { createForm } from "svelte-forms-lib";
    import { InformationCircle } from "svelte-ionicons";
    import { UilAngleDown, UilSearch } from "svelte-unicons";
    import { closeModal, showModal } from "$lib/stores/app";
    import { failure, success } from "$lib/utils/toast";

    export let items = [];

    const dispatch = createEventDispatcher();

    let hubs = [];
    let users = [];

    const { form, errors, handleSubmit, handleReset } = createForm({
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
            showModal();

            const pkgs = items.map(id => ({
                package: {id: id},
                hub: values.hub,
                courier: values.courier
            }));

            try {
                const res = await clientFetch({
                    path: "/deliveries/bulk",
                    method: "POST",
                    body: {
                        "create": pkgs
                    }
                });
                const json = await res.json();
                if (!res.ok) throw json;

                handleReset();
                success("Delivery created successfully");

                dispatch('done');
            } catch (error) {
                failure(error);
            } finally {
                closeModal()
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
</script>

<div style="z-index:1000" class="{$$props.class}">
    <form style="z-index:1000000" on:submit={handleSubmit} class="min-h-[300px]">
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
            <Dropdown class="p-3 min-w-[300px]" style="max-height:150px; overflow-y:auto;" >
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
            <Dropdown class="p-3 min-w-[300px]" style="max-height:150px; overflow-y:auto;" >
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
                on:click={() => (dispatch('close'))}>
                Cancel
            </Button>
            <Button type="submit">Submit</Button>
        </div>
    </form>
</div>