<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { Button, Checkbox, Helper, Input, Label, Spinner } from "flowbite-svelte";
    import { clientFetch } from "$lib/client/api";
    import { createEventDispatcher } from "svelte";
    import { failure, success } from "$lib/utils/toast";
    
    export let data;

    const dispatch = createEventDispatcher();

    let isLoading = false, obscureText = false;

    const { form, errors, handleSubmit, handleReset } = createForm({
        initialValues: {
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            password: "",
            checked: false,
        },
        validationSchema: yup.object().shape({
            email: yup.string().email().required().label("Email"),
            name: yup.string().required().label("Name"),
            phone: yup.string().optional().label("Phone"),
            password: yup.string().min(8).nullable().optional().label("Password"),
            checked: yup.bool(),
        }),
        async onSubmit(values) {
            isLoading = false;

            try {
                let res = await clientFetch({
                    path: "users/" + data.id,
                    method: "PUT",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("User updated sucessfully");
                handleReset();
                dispatch('close', true);
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false
            }
        }
    })
</script>

<div>
    <form on:submit={handleSubmit}>
        <div class="form-control">
            <Label for="name" class="mb-2 font-normal">Name:</Label>
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
            <Label for="email" class="mb-2 font-normal">Email address</Label>
                <Input 
                    type="email" 
                    id="email" 
                    bind:value={$form.email}
                    placeholder="Enter email" 
                    color="{$errors.email ? 'red' : 'base'}" 
                />
            {#if $errors.email}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.email }
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Label for="phone" class="mb-2 font-normal">Phone number</Label>
            <Input 
                type="text" 
                id="phone" 
                bind:value={$form.phone}
                placeholder="Enter phone number" 
                color="{$errors.phone ? 'red' : 'base'}" 
            />
            {#if $errors.phone}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.phone }
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Label for="phone" class="mb-2 font-normal">Password:</Label>
            <Input 
                type={obscureText ? "password" : "text"}
                id="phone" 
                bind:value={$form.password}
                placeholder="Enter new password" 
                color="{$errors.password ? 'red' : 'base'}" 
            />
            {#if $errors.password}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.password }
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Checkbox 
                bind:checked={$form.checked}
                class="font-normal text-xs text-base-content/70">
                I agree to the above changes made.
            </Checkbox>
        </div>
        <div class="fomr-control mt-4">
            <Button type="submit" size="lg" class="w-full" disabled={isLoading || !$form.checked}>
                {#if isLoading}
                <Spinner class="mr-3" size="4" color="white" />
                {/if}
                Submit
            </Button>
        </div> 
    </form>
</div>