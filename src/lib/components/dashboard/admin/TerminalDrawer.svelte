<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { Button, Label, Input, Helper, Spinner, Select, CloseButton, Textarea } from "flowbite-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { failure, success } from "$lib/utils/toast";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { UilCancel, UilTimes } from "svelte-unicons";

    export let data;

    const dispatch = createEventDispatcher();
    let isLoading = false;
    let countries = [];
    let states = [];

    onMount(() => {

        if (data) {
            $form = Object.assign($form, {
                name: data.name,
                code: data.code,
                address: data.address || "",
                state_id: data.state_id,
                country_id: data.country_id,
            })
        }

        getCountries();
    })

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            name: "",
            code: "",
            country_id: "",
            state_id: ""
        },
        validationSchema: yup.object().shape({
            name: yup.string().required().label("Name"),
            code: yup.string().required().label("Code"),
            address: yup.string().optional().label("Address"),
            state_id: yup.string().required().label("State"),
        }),
        async onSubmit(values) {

            isLoading = true;

            try {
                let res = await clientFetch({
                    method: data ? "PUT" : "POST",
                    path: `/hubs${data ? '/' + data.id : ''}`,
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("Operation sucessful");
                handleReset();
                dispatch('close', true);
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
                return;
            }
        }
    });

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        }).finally(() => {

            if (!$form.country_id) {
                let ng = countries.find(e => e.code == "NG");
                $form.country_id = ng?.id;
            }

            getStates();
        });
    }

    function getStates() {
        let q = new URLSearchParams({
            country_id: $form.country_id,
            limit: 1000
        }).toString()
        axiosFetch.get("/states?" + q)
        .then(res => {
            states = res.data.data;
        });
    }
</script>

<div class="mt-4">
    <div class="pb-5">
        <Button
            color="none"
            class="p-0 text-primary"
            on:click={() => (dispatch('close'))}>
            <span class="mr-2"><UilTimes /> </span>
            Close
        </Button>
    </div>
    <form on:submit={handleSubmit}>
        <div class="form-control">
            <Label for="code" class="mb-2 font-normal">Code</Label>
            <Input
                type="text"
                id="code"
                bind:value={$form.code}
                placeholder="Enter code"
                olor="{$errors.code ? 'red' : 'base'}" 
            />
            {#if $errors.code }
            <Helper color="red" class="mt-2">
                <strong>Oops! </strong>
                <span>{ $errors.code }</span>
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Label for="name" class="mb-2 font-normal">Name</Label>
            <Input
                type="text"
                id="name"
                bind:value={$form.name}
                placeholder="Enter name"
                olor="{$errors.name ? 'red' : 'base'}" 
            />
            {#if $errors.name }
            <Helper color="red" class="mt-2">
                <strong>Oops! </strong>
                <span>{ $errors.name }</span>
            </Helper>
            {/if}
        </div>

        <div class="form-control">
            <Label for="address" class="mb-2 font-normal">Address</Label>
                <Textarea 
                    id="address" 
                    bind:value={$form.address}
                    placeholder="Enter address" 
                    color="{$errors.address ? 'red' : 'base'}" 
                    rows={2}
                />
            {#if $errors.address}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp!</span>
                { $errors.address }
            </Helper>
            {/if}
        </div>

        <div class="form-control">
            <Label for="state" class="mb-2 font-normal">State</Label>
            <Select 
                id="state" 
                placeholder="Select state"
                bind:value={$form.state_id}
                items={states.map(e => ({value: e.id, name: e.name }))}
                color="{$errors.state_id ? 'red' : 'base'}" 
                disabled={!!data}
            />
            {#if $errors.state_id}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp!</span>
                { $errors.state_id }
            </Helper>
            {/if}
        </div>

        <div class="form-control" class:hidden={!!data}>
            <Label for="country" class="mb-2 font-normal">Country</Label>
            <Select 
                id="region"
                bind:value={$form.country_id}
                items={countries.map(e => ({value: e.id, name: e.name}))}
                placeholder="Select country"
                on:change={getStates}
                disabled={!!data}
            />
            {#if $errors.country_id }
            <Helper color="red" class="mt-2">
                <strong>Oops! </strong>
                <span>{ $errors.country_id }</span>
            </Helper>
            {/if}
        </div>

        <div class="fomr-control mt-4">
            <Button type="submit" size="lg" class="w-full" disabled={isLoading}>
                {#if isLoading}
                <Spinner class="mr-3" size="4" color="white" />
                {/if}
                Submit
            </Button>
        </div>
        
    </form>
</div>