<script>
    import { UilEye, UilEyeSlash } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure } from '$lib/utils/toast';
    import { setUser, updateUser } from '$lib/stores/user';
    import { clientFetch } from '$lib/client/api';
    import { networkError } from '$lib/utils/helpers';
    import { roleRoutes } from '$lib/data/roles';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
   

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
            console.log("step 3");
            isLoading = true;

            try {
                let res = await clientFetch({
                    method: "POST",
                    path: "/auth/login",
                    body: values
                });
                console.log("step 2");
                const json = await res.json();
                if (!res.ok) throw json;

                const profileData = Object.assign(json.data.user, json.data.auth);
                profileData.role = json.data.user.role;

                setUser(profileData);

                // get the session
                res = await clientFetch({ path: "/auth/session" });
                if (res.ok) {
                    console.log("step 1");
                    updateUser((await res.json()).data, true);
                }

                handleReset();

                // got the dashboard
                // goto(roleRoutes[profileData.role], { replaceState: true });

                const uri = $page.url
                uri.pathname = roleRoutes[profileData.role];
                window.location.href = uri.toString();
                
            } catch (error) {
                failure(networkError(error));
            } finally {
                isLoading = false;
            }
        }
    });

</script>

<div class="page flex flex-col items-center justify-center w-screen h-screen md:bg-primary/5">
    <div class="w-full max-w-4xl grid md:grid-cols-2 md:shadow-md bg-base-100 md:divide-x rounded-lg">
        <div class="bg-white flex-col items-center justify-center hidden md:flex">
            <img src="/images/egg-logo.png" alt="">
            <div class="px-6 py-8 text-center space-y-2 text-sm">
                <h3 class="font-bold text-sm">Delivered with Precision: Your Package, Our Priority</h3>
                <p class="text-xs pb-3 text-base-content/60">Experience seamless delivery with our commitment to accuracy and care, ensuring your packages arrive exactly as they were sent.</p>
                <div class="w-6 h-1 rounded-full bg-primary mx-auto" />
            </div>
        </div>
        <form on:submit={handleSubmit} class="py-10 md:px-8">
            <h3 class="text-center text-2xl font-bold pb-2">Login to your account</h3>
            <p class="text-center text-base-content/60 text-sm mb-8">
                Welcome back! Please enter your details
            </p>

            <div class="form-control w-full">
                <label class="label" for="email">
                    <span class="label-text">Email</span>
                </label>
                <input
                    type="email"
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
                    <span class="label-text">Password</span>
                    <a href="/auth/forgot-password" class="label-text-alt text-sm text-primary font-medium hidden">Forgot password?</a>
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
            <div class="form-control items-end">
                <!-- <label for="remember-me" class="cursor-pointer label justify-start gap-x-4">
                    <input type="checkbox" name="remember_me" id="remember-me" class="checkbox checkbox-primary">
                    <span class="label-text">Remember me</span>
                </label> -->
                <a href="/auth/forgot-password" class="label-text-alt text-sm text-primary font-medium">Forgot password?</a>
            </div>
            <div class="w-full pt-2">
                <button 
                    class="btn w-full btn-primary font-semibold" 
                    type="submit" class:btn-disabled={isLoading}>
                    <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                    Login
                </button>
            </div>
            <!-- <div class="text-center my-4">
                <span class="text-sm">Don’t have an account? <a href="/auth/register" class="text-primary font-semibold">Sign up</a></span>
            </div> -->
        </form>
    </div>
</div>