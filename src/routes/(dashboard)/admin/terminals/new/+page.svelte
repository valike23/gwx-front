<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure, success } from '$lib/utils/toast';
    import { axiosFetch, clientFetch } from '$lib/client/api';
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let countries = [];
    let states = [];

    onMount(() => {
        getCountries();
    })

    let isLoading = false;

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            code: "",
            name: "",
            address: "",
            state_id: "",
            is_express: false,
            country_id: ""
        },
        validationSchema: yup.object().shape({
            code: yup.string().min(2).required().label("Code"),
            name: yup.string().min(2).required().label("Name"),
            address: yup.string().min(2).required().label("Address"),
            country_id: yup.string().required().label("Country"),
            state_id: yup.string().required().label("State"),
            is_express: yup.bool().default(false)
        }),
        async onSubmit(values) {

            isLoading = true;

            try {
                let res = await clientFetch({
                    method: "POST",
                    path: "/hubs",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("Station created successfully");

                handleReset();
                
                goto("/admin/terminals/" + json.data.id);
                
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
                return;
            }
        }
    });

    function getCountries() {
        axiosFetch.get("/countries?limit=1000")
        .then(res => {
            countries = res.data.data;
        });
    }

    function getStates() {
        axiosFetch.get(`/countries/${$form.country_id}/states?limit=1000`)
        .then(res => {
            states = res.data.data;
        });
    }
</script>

<div class="page">
    <div class="mb-4">
        <h2 class="font-medium">New Terminal</h2>
    </div>

    <div class="bg-base-100 rounded-md shadow-sm max-w-2xl p-8">
        <form on:submit={handleSubmit}>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control w-full">
                    <label class="label" for="code">
                        <span class="label-text">Code</span>
                    </label>
                    <input
                        type="text"
                        name="code"
                        id="code"
                        placeholder="Terminal code"
                        bind:value={$form.code}
                        class="input input-bordered input-md"
                        class:input-error={$errors.code}
                    />
                    {#if $errors.code}
                        <span class="error">{$errors.code}</span>
                    {/if}
                </div>
                <div class="form-control w-full">
                    <label class="label" for="name">
                        <span class="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Terminal name"
                        bind:value={$form.name}
                        class="input input-bordered input-md"
                        class:input-error={$errors.name}
                    />
                    {#if $errors.name}
                        <span class="error">{$errors.name}</span>
                    {/if}
                </div>
            </div>
            <div class="form-control w-full">
                <label class="label" for="address">
                    <span class="label-text">Address</span>
                </label>
                <input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="Terminal address"
                    bind:value={$form.address}
                    class="input input-bordered input-md"
                    class:input-error={$errors.address}
                />
                {#if $errors.address}
                    <span class="error">{$errors.address}</span>
                {/if}
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="form-control w-full">
                    <label class="label" for="state">
                        <span class="label-text">State</span>
                    </label>
                    <select 
                        name="state" 
                        id="state"
                        class="select select-bordered select-md"
                        bind:value={$form.state_id}
                        class:input-error={$errors.state_id}
                    >
                        <option value="" disabled>Select State</option>
                        {#each states as item }
                        <option value="{item.id}">
                            { item.name }
                        </option>  
                        {/each}
                    </select>
                    {#if $errors.state_id}
                        <span class="error">{$errors.state_id}</span>
                    {/if}
                </div>
                <div class="form-control w-full">
                    <label class="label" for="country">
                        <span class="label-text">Country</span>
                    </label>
                    <select 
                        name="country" 
                        id="country"
                        class="select select-bordered select-md"
                        bind:value={$form.country_id}
                        on:change={() => (getStates())}
                        class:input-error={$errors.country_id}
                    >
                        <option value="" disabled>Select Country</option>
                        {#each countries as item }
                        <option>
                            { item.name }
                        </option>  
                        {/each}
                    </select>
                    {#if $errors.country_id}
                        <span class="error">{$errors.country_id}</span>
                    {/if}
                </div>
                
            </div>

            <div class="mt-4">
                <button 
                    class="btn btn-primary font-semibold" 
                    type="submit" class:btn-disabled={isLoading}
                >
                    <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                    Create New Terminal
                </button>
            </div>
        </form>
    </div>
</div>