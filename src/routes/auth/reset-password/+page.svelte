<script>
    import { page } from "$app/stores";
    import { UilEye, UilEyeSlash, UilInfoCircle } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from '$lib/client/api';
    import { failure, success } from '$lib/utils/toast';
    import { goto } from '$app/navigation';
    import { Alert, Input, Label, Helper } from "flowbite-svelte";

    const auth = $page.data.auth;

    let isLoading = false;
    let obscureTexts = [false, false];

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            password: "",
            confirm_password: ""
        },
        validationSchema: yup.object().shape({
            password: yup.string().min(8).required().label("Password is required"),
            confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required("Confirm password is required"),
        }),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/auth/reset-password",
                    method: "POST",
                    body: {
                        token: auth.token,
                        password: values.password,
                        confirm_password: values.confirm_password
                    }
                })
                const json = await res.json();
                if (!res.ok) throw json;

                success(json.message);
                handleReset();

                setTimeout(() => {
                    goto("/auth/login");
                }, 2000)
                
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false;
            }
        }
    });
</script>

<div class="page flex flex-col items-center justify-center w-screen h-screen">
    <div class="w-full max-w-sm">
        {#if !auth.valid}
            <Alert color="red">
                <div class="space-y-2 py-5 text-center">
                    <div class="text-center">
                        <span class="text-center grid place-content-center">
                            <UilInfoCircle size="50"/>
                        </span>
                    </div>
                    <h3 class="text-center font-medium text-lg">Token Expired!</h3>
                    <p class="text-center">{ auth.message }</p>
                    <p class="text-center">
                        <a href="/auth/forgot-password" class="font-medium underline">Click here</a> to request a new token.
                    </p>
                </div>
                
            </Alert>
        {:else}
        <div>
            <form on:submit={handleSubmit}>
                <h3 class="text-center text-2xl font-bold pb-2">Reset your password</h3>
                <p class="text-center text-base-content/60 text-sm mb-8">
                    Enter your new password below
                </p>
    
                <div class="form-control w-full">
                    <Label for="password" class="mb-2 font-normal">New password</Label>
                    <Input
                        id="password"
                        type={obscureTexts[0] ? "password" : "text"}
                        placeholder="New password"
                        bind:value={$form.password}
                        color="{$errors.password ? 'red' : 'base'}" 
                        class="py-3"
                    >
                        <button slot="right" type="button" class="grid place-content-center" on:click={() => (obscureTexts[0] = !obscureTexts[0])}>
                            <svelte:component this={ !obscureTexts[0] ? UilEyeSlash : UilEye } size="18"/>
                        </button>
                    </Input>
                    {#if $errors.password }
                    <Helper color="red" class="mt-2">
                        <strong>Oops! </strong>
                        <span>{ $errors.password }</span>
                    </Helper>
                    {/if}
                </div>

                <div class="form-control w-full">
                    <Label for="name" class="mb-2 font-normal">Confirm password</Label>
                    <Input
                        id="name"
                        type={obscureTexts[1] ? "password" : "text"}
                        placeholder="Confirm password"
                        bind:value={$form.confirm_password}
                        color="{$errors.confirm_password ? 'red' : 'base'}" 
                        class="py-3"
                    >
                        <button slot="right" type="button" class="grid place-content-center" on:click={() => (obscureTexts[1] = !obscureTexts[1])}>
                            <svelte:component this={ !obscureTexts[1] ? UilEyeSlash : UilEye } size="18"/>
                        </button>
                    </Input>
                    {#if $errors.password }
                    <Helper color="red" class="mt-2">
                        <strong>Oops! </strong>
                        <span>{ $errors.confirm_password }</span>
                    </Helper>
                    {/if}
                </div>
                <div class="w-full pt-2">
                    <button 
                        class="btn w-full btn-primary font-semibold" 
                        type="submit" class:btn-disabled={isLoading}>
                        <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                        Reset Password
                    </button>
                </div>
                <div class="text-center my-4">
                    <span class="text-sm"><a href="/auth/login" class="text-base-content/60">Back to login</a></span>
                </div>
            </form>
        </div>
        {/if}
    </div>
    
</div>