<script>
    import * as yup from 'yup';
    import { clientFetch } from "$lib/client/api";
    import { debounce } from "$lib/utils/helpers";
    import { Avatar, Button, CloseButton, Dropdown, Input, Spinner } from "flowbite-svelte";
    import { createEventDispatcher } from "svelte";
    import { createForm } from "svelte-forms-lib";
    import { UilAngleDown, UilSearch } from "svelte-unicons";
    import { page } from '$app/stores';
    import { toast } from '@zerodevx/svelte-toast';
    import { failure, success } from '$lib/utils/toast';

    const dispatch = createEventDispatcher();
    let users = [];
    let user;
    let name = "";
    let isLoading = false;

    const { form, errors, handleSubmit, handleReset } = createForm({
        initialValues: {
            uid: "",
            role: "Admin"
        },
        validationSchema: yup.object().shape({
            "uid": yup.string().required("Select a user"),
            "role": yup.string().default("Admin")
        }),
        async onSubmit(values) {
            isLoading = true;

            values.title = values.role;

            try {
                const res = await clientFetch({
                    path: `/hubs/${$page.params.id}/users`,
                    method: "POST",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;
                success(json.message);
                dispatch('close', true);
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    });

    function findUsers(e) {
        clientFetch({
            path: "/users",
            query: {
                search: e.target.value,
                role: 'manager',
                limit: 5
            }
        })
        .then(res => res.json())
        .then(json => {
            if (json.data) {
                users = json.data;
            }
            
        });
    }

</script>
<div>
    <div class="text-right">
        <CloseButton on:click={() => (dispatch('close'))} />
    </div>

    <form on:submit={handleSubmit} class="mt-4">
        <h3 class="font-medium mb-4">Add User</h3>
        <div class="form-control w-full">
            <Button color="{$errors.uid ? 'red' : 'none'}" outline class="flex gap-3">
                <Avatar size="md" />
                <div class="flex-1 text-start">
                    <div class="font-normal text-sm">{ user?.name || "Select a user"}</div>
                    <div class="text-xs text-gray-400">{ user?.email || "Not set" }</div>
                </div>
                <span><UilAngleDown /></span>
            </Button>
            <Dropdown class="w-[340px] p-3">
                <div class="w-full py-3">
                    <Input
                        type="text"
                        placeholder="Search user..."
                        on:keyup={(e) => (debounce(() => findUsers(e), 400))}
                    >
                        <span slot="left" class="text-primary"><UilSearch size="20" /></span>
                    </Input>
                </div>
                {#each users as item }
                <button 
                    on:click={() => {
                        user = item;
                        $form.uid = item.id;
                        name = null;
                        users = [];
                    }}
                    class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                    <Avatar size="sm" />
                    <div class="flex-1 text-left text-sm">
                        <div>{ item.name }</div>
                        <div class="text-gray-400 text-xs">{ item.email || user.phone || "" }</div>
                    </div>
                </button>
                {/each}
            </Dropdown>
        </div>
        
        <div class="form-control">
            <Button type="submit" disabled={isLoading}>
                {#if isLoading}
                <Spinner size="4" class="mr-3" />
                {/if}
                Submit
            </Button>
        </div>
    </form>
</div>