<script>
    import { UilEye, UilEyeSlash } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from '$lib/client/api';
    import { failure, success } from '$lib/utils/toast';
    import { goto } from '$app/navigation';

    let isLoading = false;
    let obscureText = true;

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            email: "",
        },
        validationSchema: yup.object().shape({
            email: yup.string().email().required().label("Email"),
        }),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/auth/forgot-password",
                    method: "POST",
                    body: values
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
        <form on:submit={handleSubmit}>
            <h3 class="text-center text-2xl font-bold pb-2">Forgot your password</h3>
            <p class="text-center text-base-content/60 text-sm mb-8">
                Enter your email address below to receive password reset instructions.
            </p>

            <div class="form-control w-full">
                <label class="label" for="email">
                    <span class="label-text">Email</span>
                </label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    placeholder="user@email.com"
                    bind:value={$form.email}
                    class="input input-bordered input-md"
                    class:input-error={$errors.email}
                />
                {#if $errors.email}
                    <span class="error">{$errors.email}</span>
                {/if}
            </div>
            <div class="w-full pt-2">
                <button 
                    class="btn w-full btn-primary font-semibold" 
                    type="submit" class:btn-disabled={isLoading}>
                    <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                    Send Reset Instructions
                </button>
            </div>
            <div class="text-center my-4">
                <span class="text-sm"><a href="/auth/login" class="text-base-content/60">Back to login</a></span>
            </div>
        </form>
    </div>
</div>