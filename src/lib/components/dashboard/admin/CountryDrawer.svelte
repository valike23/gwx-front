<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { CloseButton, Button, Label, Input, Helper, Spinner, Alert } from "flowbite-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { failure, success } from "$lib/utils/toast";
    import { clientFetch } from "$lib/client/api";

    export let data;
    let isLoading = false;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (data) {
            $form = Object.assign($form, {
                code: data.code || "",
                name: data.name || ""
            })
        }
    })

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            name: "",
            code: ""
        },
        validationSchema: yup.object().shape({
            code: yup.string().min(2).required().label("Code"),
            name: yup.string().min(2).required().label("Name"),
        }),
        async onSubmit(values) {

            isLoading = true;

            try {
                let res = await clientFetch({
                    method: data ? "PUT" : "POST",
                    path: `/countries${data ? '/' + data.id : ''}`,
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

</script>
<div>
    <div class="flex justify-between items-center">
        <CloseButton on:click={() => (dispatch('close'))} />
    </div>

    <Alert class="my-4 text-xs" color="blue">
        <span class="font-medium">Careful!</span>
        <span>This will affect all entities related to the country.</span>
    </Alert>
    <form on:submit={handleSubmit}>
        <div class="form-control">
            <Label for="name" class="mb-2 font-normal">Code</Label>
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