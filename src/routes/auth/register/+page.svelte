<script>
    import { UilEye, UilEyeSlash } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { clientFetch } from '$lib/client/api';
    import { networkError } from '$lib/utils/helpers';
    import { failure, success } from '$lib/utils/toast';
    import { goto } from '$app/navigation';

    let isLoading = false;
    let obscureText = true;
    let scopes = [
        {name: "Individual", value: "customer"},
        {name: "Business", value: "business"}
    ];

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            email: "",
            password: "",
            scope: "customer"
        },
        validationSchema: yup.object().shape({
            name: yup.string().required().label("Name"),
            email: yup.string().email().required().label("Email"),
            phone: yup.string().optional().label("Phone"),
            department: yup.string().optional().label("Department"),
            scope: yup.string().oneOf(["individual", "business"]),
            password: yup.string().min(8).required().label("Password"),
        }),
        async onSubmit(values) {
            isLoading = true;

            try {
                const res = await clientFetch({
                    method: "POST",
                    path: "/auth/register",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("Account created successfully");

                goto("/auth/login");
                
            } catch (error) {
                failure(networkError(error));
            } finally {
                isLoading = false;
                return;
            }
        }
    });

    function changeScope() {
        let val = scopes.find(e => e.value !=$form.scope).value;
        $form.scope = val;
    }

</script>

<div class="page p-0 md:p-8 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl">
        <form on:submit={handleSubmit} class="bg-base-100 py-8 px-8 shadow-sm">
            <h3 class="text-2xl font-bold pb-2">Welcome to GWX</h3>
            <p class="text-base-content/60 text-sm mb-8">
                Sign up to get started
            </p>

            <div class="flex justify-center items-center gap-x-4 mb-4 my-2">
                <div class="tabs tabs-boxed bg-slate-50">
                    {#each scopes as scope }
                    <button 
                        class="w-32 h-11 tab transition-all focus:border-none hover:border-none {($form.scope == scope.value) ? 'bg-primary/20 text-primary font-medium' : ''}"
                        type="button"
                        
                        on:click={changeScope}
                    >
                        { scope.name }
                    </button>
                    {/each}
                </div>
                
            </div>

            <div class="form-control w-full">
                <label class="label" for="name">
                    <span class="label-text">{ $form.scope == "customer" ? 'Full name' : 'Business name' }</span>
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter name"
                    bind:value={$form.name}
                    class="input input-bordered input-md"
                    autocomplete="name"
                    class:input-error={$errors.name}
                />
                {#if $errors.name}
                    <span class="error">{$errors.name}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="email">
                    <span class="label-text">Email address</span>
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email address"
                    bind:value={$form.email}
                    class="input input-bordered input-md"
                    autocomplete="email"
                    class:input-error={$errors.email}
                />
                {#if $errors.email}
                    <span class="error">{$errors.email}</span>
                {/if}
            </div>
            <div class="grid sm:grid-cols-2 md:gap-4">
                <div class="form-control w-full">
                    <label class="label" for="phone">
                        <span class="label-text">Phone number</span>
                    </label>
                    <input
                        type="phone"
                        name="phone"
                        id="phone"
                        placeholder="+2348012345678"
                        bind:value={$form.phone}
                        class="input input-bordered input-md"
                        autocomplete="tel"
                        class:input-error={$errors.phone}
                    />
                    {#if $errors.phone}
                        <span class="error">{$errors.phone}</span>
                    {/if}
                </div>
                <div class="form-control w-full">
                    <label class="label" for="department">
                        <span class="label-text">Department or Category</span>
                    </label>
                    <input
                        type="text"
                        name="department"
                        id="department"
                        placeholder="Department or category"
                        bind:value={$form.department}
                        class="input input-bordered input-md"
                        class:input-error={$errors.department}
                    />
                    {#if $errors.department}
                        <span class="error">{$errors.department}</span>
                    {/if}
                </div>
            </div>
            <div class="form-control w-full">
                <label class="label" for="password">
                    <span class="label-text">Password</span>
                </label>
                <div class="w-full relative">
                    <input
                        type={obscureText ? "password" : "text"}
                        name="password"
                        id="pasword"
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
                    Create account
                </button>
            </div>
            <div class="text-center my-4">
                <span class="text-sm">Already have an account? <a href="/auth/login" class="text-primary font-semibold">Log in </a></span>
            </div>
        </form>
    </div>
</div>