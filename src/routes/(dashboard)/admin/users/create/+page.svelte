<script>
    import { Breadcrumb, BreadcrumbItem, Checkbox } from 'flowbite-svelte';
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { createEventDispatcher, onMount } from "svelte";
    import { Input, Textarea, Select, Label, Helper, Spinner, Button } from "flowbite-svelte";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { failure, success } from "$lib/utils/toast";
    import { UilEye, UilEyeSlash } from "svelte-unicons";

    const dispatch = createEventDispatcher();

    let isLoading = false;
    let obscureText = true;
    let countries = [];
    let states = [];

    onMount(() => {
        getCountries();
    })

    const roles = {
        "admin": "Admin",
        "manager": "Manager",
        "courier": "Courier"
    }

    const { form, errors, handleReset, handleSubmit } = createForm({
        initialValues: {
            name: "",
            email: "",
            country: {},
            state: {},
            role: "admin"
        },
        validationSchema: yup.object().shape({
            email: yup.string().email().required().label("Email"),
            name: yup.string().required().label("Name"),
            phone: yup.string().optional().label("Phone"),
            department: yup.string().optional().label("Department"),
            role: yup.string().oneOf(Object.keys(roles)),
            address: yup.string().optional().label("Address"),
            password: yup.string().min(8).nullable().optional().label("Password"),
            checked: yup.bool(),
            state: yup.object().shape({
                id: yup.string(),
                code: yup.string(),
                name: yup.string()
            }).label("State"),
            country: yup.object().shape({
                id: yup.string(),
                code: yup.string(),
                name: yup.string()
            }).label("Country"),
        }),
        async onSubmit(values) {

            isLoading = true;

            if (!values.checked) {
                delete values.password;
                delete values.checked;
            }

            try {
                let res = await clientFetch({
                    method: "POST",
                    path: "/users",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("User created sucessfully");
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

            if ($form.country?.id && !states.length) {
                getStates();
            }
        });
    }

    function getStates() {
        let q = new URLSearchParams({
            country_id: $form.country?.id,
            limit: 1000
        }).toString()
        axiosFetch.get("/states?" + q)
        .then(res => {
            states = res.data.data;
        });
    }
</script>

<div class="gwx-breadcrumb">
    <Breadcrumb aria-label="GWX breadcrumb">
        <BreadcrumbItem href="/admin" home>Dashboard</BreadcrumbItem>
        <BreadcrumbItem href="/admin/users">Users</BreadcrumbItem>
        <BreadcrumbItem>New User</BreadcrumbItem>
    </Breadcrumb>
</div>
<div class="page">
    <div class="w-full max-w-xl">
        <form on:submit={handleSubmit}>
            <div class="grid grid-cols-2">
                <div class="form-control">
                    <Label for="country" class="mb-2 font-normal">Role</Label>
                    <Select 
                        id="role" 
                        placeholder="Select country"
                        bind:value={$form.role}
                        on:change={() => (getStates())}
                        items={Object.entries(roles).map(e => ({value: e[0], name: e[1] }))}
                        color="{$errors.role ? 'red' : 'base'}" 
                    />
                    {#if $errors.role}
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Oh, snapp!</span>
                        { $errors.role }
                    </Helper>
                    {/if}
                </div>
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
    
            <div class="grid grid-cols-2 gap-x-6">
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
                    <Label for="department" class="mb-2 font-normal">Department</Label>
                        <Input 
                            type="text" 
                            id="department" 
                            bind:value={$form.department}
                            placeholder="Enter department" 
                            color="{$errors.department ? 'red' : 'base'}" 
                        />
                    {#if $errors.department}
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Oh, snapp!</span>
                        { $errors.department }
                    </Helper>
                    {/if}
                </div>
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
            <div class="grid grid-cols-2 gap-x-6">
                <div class="form-control">
                    <Label for="state" class="mb-2 font-normal">State</Label>
                    <Select 
                        id="state" 
                        placeholder="Select state"
                        bind:value={$form.state.id}
                        items={states.map(e => ({value: e.id, name: e.name }))}
                        color="{$errors.state.id ? 'red' : 'base'}" 
                    />
                    {#if $errors.state.id}
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Oh, snapp!</span>
                        { $errors.state.id }
                    </Helper>
                    {/if}
                </div>
                <div class="form-control">
                    <Label for="country" class="mb-2 font-normal">Country</Label>
                    <Select 
                        id="country" 
                        placeholder="Select country"
                        bind:value={$form.country.id}
                        on:change={() => (getStates())}
                        items={countries.map(e => ({value: e.id, name: e.name }))}
                        color="{$errors.country.id ? 'red' : 'base'}" 
                    />
                    {#if $errors.country.id}
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Oh, snapp!</span>
                        { $errors.country.id }
                    </Helper>
                    {/if}
                </div>
            </div>

            <div class="form-control mt-5">
                <Checkbox 
                    bind:checked={$form.checked}
                    on:change={(e) => {
                        if (!$form.checked) {
                            $form.password = null;
                        }
                    }}
                    class="font-normal">Automatically create a password</Checkbox>
                <div class="pl-6">
                    <div class="text-xs my-4 text-gray-500">
                        Passwords must be at least 8 characters long.
                    </div>
                    <Label for="password" class="mb-2 font-normal">
                        Password
                    </Label>
                    <Input
                        type={obscureText ? "password" : "text"}
                        color="{$errors.password ? 'red' : 'base'}" 
                        bind:value={$form.password}>
                        <button type="button" class="grid place-content-center" slot="right" on:click={() => (obscureText = !obscureText)}>
                            <svelte:component this={ !obscureText ? UilEyeSlash : UilEye } size="18"/>
                        </button>
                    </Input>
                    {#if $errors.password}
                    <Helper class="mt-2" color="red">
                        <span class="font-medium">Oh, snapp!</span>
                        { $errors.password }
                    </Helper>
                    {/if}
                </div>
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
</div>