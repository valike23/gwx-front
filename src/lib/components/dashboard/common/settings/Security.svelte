<script>
    import { UilEye, UilEyeSlash } from 'svelte-unicons'
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure, success } from '$lib/utils/toast';
    import { axiosFetch, clientFetch } from '$lib/client/api';

    let isLoading = false;
    let obscures = [true, true, true];

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            password: "",
            new_password: "",
            confirm_password: ""
        },
        validationSchema: yup.object().shape({
            password: yup.string().min(8).required().label("Current password"),
            new_password: yup.string().min(8).required().label("New password"),
            confirm_password: yup.string().min(8).oneOf([yup.ref('new_password'), null], 'Passwords must match').label("Confirm password"),
        }),
        async onSubmit(values) {
            isLoading = true;
            setTimeout(() => {}, 5000);
            console.log(values);
            try {
                const res = await clientFetch({
                    method: "POST",
                    path: "/account/change-password",
                    body: values
                });
                const json = await res.json();
                if (!res.ok) throw json;

                handleReset();
                success(json.data);
            } catch (error) {
                console.log(error);
                failure(error);
            } finally {
                isLoading = false
            }
        }
    });
    
</script>

<div>
    <h2 class="font-medium mb-2">Change Password</h2>
    <p class="text-xs text-base-content/60">Change your GWX logistics password using the form below</p>

    <form on:submit={handleSubmit} class="py-10">
        <div class="grid md:grid-cols-2 gap-8">
            <div class="form-control w-full">
                <label class="label" for="password">
                    <span class="label-text">Current Password</span>
                </label>
                <div class="w-full relative">
                    <input
                        type={obscures[0] ? "password" : "text"}
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        class="input input-bordered input-md w-full"
                        class:input-error={$errors.password}
                        on:change={
                            (e) => {
                                $form.password = e.target.value;
                            }
                        }
                    />
                    <button type="button" class="absolute grid place-content-center top-0 right-0 w-12 h-12" on:click={() => (obscures[0] = !obscures[0])}>
                        <svelte:component this={ !obscures[0] ? UilEyeSlash : UilEye } size="18"/>
                    </button>
                    
                </div>
                {#if $errors.password}
                    <span class="error">{$errors.password}</span>
                {/if}
            </div>
        </div>
        <div class="grid md:grid-cols-2 md:gap-8">
            <div class="form-control w-full">
                <label class="label" for="new-password">
                    <span class="label-text">New Password</span>
                </label>
                <div class="w-full relative">
                    <input
                        type={obscures[1] ? "password" : "text"}
                        name="new_password"
                        id="new-password"
                        placeholder="Enter your new password"
                        class="input input-bordered input-md w-full"
                        class:input-error={$errors.new_password}
                        on:change={
                            (e) => {
                                $form.new_password = e.target.value;
                            }
                        }
                    />
                    <button type="button" class="absolute grid place-content-center top-0 right-0 w-12 h-12" on:click={() => (obscures[1] = !obscures[1])}>
                        <svelte:component this={ !obscures[1] ? UilEyeSlash : UilEye } size="18"/>
                    </button>
                    
                </div>
                {#if $errors.password}
                    <span class="error">{$errors.password}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="confirm-password">
                    <span class="label-text">Confirm Password</span>
                </label>
                <div class="w-full relative">
                    <input
                        type={obscures[2] ? "password" : "text"}
                        name="confirm_password"
                        id="confirm-password"
                        placeholder="Confirm password"
                        class="input input-bordered input-md w-full"
                        class:input-error={$errors.confirm_password}
                        on:change={
                            (e) => {
                                $form.confirm_password = e.target.value;
                            }
                        }
                    />
                    <button type="button" class="absolute grid place-content-center top-0 right-0 w-12 h-12" on:click={() => (obscures[2] = !obscures[2])}>
                        <svelte:component this={ !obscures[2] ? UilEyeSlash : UilEye } size="18"/>
                    </button>
                    
                </div>
                {#if $errors.confirm_password}
                    <span class="error">{$errors.confirm_password}</span>
                {/if}
            </div>
        </div>
        <div class="pt-8">
            <button 
                class="btn btn-primary font-semibold" 
                class:btn-disabled={isLoading}>
                <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                Change Password
            </button>
        </div>
    </form>
</div>