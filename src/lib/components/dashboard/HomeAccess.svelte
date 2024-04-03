<script>
    import { goto } from '$app/navigation';
    import { UilEye, UilEyeSlash } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure } from '$lib/utils/toast';
    import { setUser } from '$lib/stores/user';
    import { page } from '$app/stores';
    import { clientFetch } from '$lib/client/api';
    import { getErrorString } from '$lib/utils/helpers';

    $: user = $page.data.session.user;

    let isLoading = false;
    let obscureText = true;

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object().shape({
            email: yup.string().email().required().label("Email"),
            password: yup.string().min(8).required().label("Password"),
        }),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    method: "POST",
                    path: "/auth/login",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json.message;
                setUser(Object.assign(json.data.user, json.data.auth));
                const uri = $page.url
                uri.pathname = "/customer";
                window.location.href = uri.toString();
            } catch (error) {
                failure(getErrorString(error));
            } finally {
                isLoading = false;
            }
        }
    });

    const links = [
        {title: "Create package", to: "/dashboard"},
        {title: "View orders", to: "/dashboard"},
        {title: "Create package", to: "/dashboard"},
    ]

</script>

<div class="shadow-sm bg-base-100 rounded-lg {$$props.class}">
    <div class="p-8">
        {#if !user}
        <form on:submit={handleSubmit}>
            <h3 class="text-xl font-bold pb-2">Login to your account</h3>
            <p class="text-base-content/60 text-sm mb-4">
                Welcome back! Please enter your details
            </p>

            <div class="form-control w-full">
                <label class="label" for="email">
                    <span class="label-text text-xs">Email</span>
                </label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    placeholder="Email address"
                    bind:value={$form.email}
                    class="input input-bordered input-md"
                    class:input-error={$errors.email}
                />
                {#if $errors.email}
                    <span class="error">{$errors.email}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="password">
                    <span class="label-text text-xs">Password</span>
                    <a href="/auth/forgot-password" class="label-text-alt text-xs text-primary font-medium">Forgot password?</a>
                </label>
                <div class="w-full relative">
                    <input
                        type={obscureText ? "password" : "text"}
                        name="password"
                        id="password"
                        placeholder="Password"
                        class="input input-bordered input-md w-full"
                        class:input-error={$errors.password}
                        on:change={
                            (e) => {
                                $form.password = e.target.value;
                            }
                        }
                    />
                    <button type="button" class="absolute grid place-content-center top-0 right-0 w-12 h-12" on:click={() => (obscureText = !obscureText)}>
                        <svelte:component this={ !obscureText ? UilEyeSlash : UilEye } size="18"/>
                    </button>
                    
                </div>
                {#if $errors.password}
                    <span class="error">{$errors.password}</span>
                {/if}
            </div>
            <div class="w-full pt-2">
                <button 
                    class="btn w-full btn-primary font-semibold" 
                    type="submit" class:btn-disabled={isLoading}>
                    <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                    Login
                </button>
            </div>
            <div class="text-center my-4">
                <span class="text-xs">Don’t have an account? <a href="/auth/register" class="text-primary font-semibold">Sign up</a></span>
            </div>
        </form>

        {:else}
        <div>
            <h3 class="text-xl font-bold pb-2">Welcome back! 👋🏽</h3>
            <p>{ user.name }</p>
            <p class="mt-5 text-base-content/50">Quick Links:</p>
            <div class="flex gap-3 flex-wrap py-4">
            {#each links as l }
                <a href="{l.to}" class="btn bg-primary/5 text-primary border-none font-normal text-xs">
                    { l.title }
                </a>
            {/each}
            </div>
            <div class="py-2">
                <a href="/customer" class="text-primary font-medium text-sm">
                    Go to dashboard
                </a>
            </div>
        </div>
        {/if}
    </div>
</div>