<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { failure, success } from '$lib/utils/toast';
    import { setUser } from '$lib/stores/user';
    import { clientFetch } from "$lib/client/api";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { getJSON } from "$lib/utils/helpers";

    $: user = $page.data.session.user;

    let isLoading = false;
    let countries = [];
    let states = [];

    onMount(() => {
        $form.name = user.name;
        $form.email = user.email;
        $form.phone = user.phone || "";
        $form.department = user.department || "";
        $form.address = user.address || "";
        $form.country = Object.assign({}, getJSON(user.country))
        $form.state = Object.assign({}, getJSON(user.state))
        $form.city = user.city || "";
        $form.zip = user.zip || "";

        // get countries
        getCountries();
    })

    const { form, errors, handleSubmit } = createForm({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            department: "",
            address: "",
            country: {},
            state: {},
            city: "",
            zip: ""
        },
        validationSchema: yup.object().shape({
            name: yup.string().min(8).required().label("Name"),
            email: yup.string().email().required().label("email"),
            phone: yup.string().label("Phone"),
            department: yup.string().label("Department"),
            address: yup.string().label("Address"),
            country: yup.object().shape({
                "id": yup.string(),
                "name": yup.string()
            }).label("Country"),
            state: yup.object().shape({
                "id": yup.string(),
                "name": yup.string()
            }).label("State"),
            zip: yup.string().label("Zip")
        }),
        async onSubmit(values) {
            isLoading = true;
            try {
                const res = await clientFetch({
                    path: "/account",
                    method: "PUT",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                setUser(json.data, true);
                
                setTimeout(() => {
                    window.location.reload();
                    success("Profile updated successfully");
                }, 1000);
            } catch (error) {
                console.log(error.stack);
                failure(error);
            } finally {
                isLoading = false
            }
        }
    });

    function getCountries() {
        clientFetch({
            path: "/countries",
            query: {limit: 100}
        }).then(res => res.json())
        .then(json => {
            countries = json.data;
        })
        .finally(() => {
            if ($form.country.name && countries.length) {
                const c = countries.find(e => e.code == "NG");
                if (c) {
                    $form.country = {
                        id : c.id,
                        name: c.name,
                        code: c.code
                    };
                }
            }


            if ($form.country.name && !states.length) {
                getStates();
            }
        })

        // axiosFetch.get("/countries")
        // .then(res => {
        //     countries = res.data.data;
        // }).finally(() => {

        //     if ($form.country.name && countries.length) {
        //         $form.country = countries.find(e => e.code == "NG");
        //     }


        //     if ($form.country.name && !states.length) {
        //         getStates();
        //     }
        // });
    }

    function getStates() {
        if ($form.country.name) {
            $form.country_id = countries.find(e => (e.code = $form.country || e.name == $form.country.name))?.id;
        }
        let q = new URLSearchParams({
            country_id: $form.country_id,
            limit: 1000
        }).toString()

        clientFetch({
            path: "/states",
            query: {
                country_id: $form.country_id,
                limit: 1000
            }
        })
        .then(res => res.json())
        .then(json => {
            states = json.data;
        })
        .finally(() => {
            if ($form.state.name) {
                const s = states.find(e => e.name == $form.state.name);
                if (s) {
                    $form.state = {
                        id : s.id,
                        name: s.name,
                        code: s.code
                    }
                }
            }
        })
    }
</script>

<div>
    <h2 class="font-medium mb-2">Edit Profile</h2>
    <p class="text-xs text-base-content/60">Review and update your account details</p>

    <form on:submit={handleSubmit} class="py-10">
        <div class="grid md:grid-cols-2 gap-8">
            <div class="form-control w-full">
                <label class="label" for="name">
                    <span class="label-text">Name</span>
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your full name or business name"
                    bind:value={$form.name}
                    class="input input-bordered input-md"
                    class:input-error={$errors.name}
                />
                {#if $errors.name}
                    <span class="error">{$errors.name}</span>
                {/if}
            </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-x-8">
            <div class="form-control w-full">
                <label class="label" for="phone">
                    <span class="label-text">Phone number</span>
                </label>
                <input
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Phone number"
                    bind:value={$form.phone}
                    class="input input-bordered input-md"
                    class:input-error={$errors.phone}
                />
                {#if $errors.phone}
                    <span class="error">{$errors.phone}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="department">
                    <span class="label-text">Department</span>
                </label>
                <input
                    type="text"
                    name="department"
                    id="department"
                    placeholder="Category or department"
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
            <label class="label" for="address">
                <span class="label-text">Address</span>
            </label>
            <input
                type="text"
                name="address"
                id="address"
                placeholder="Address"
                bind:value={$form.address}
                class="input input-bordered input-md"
                autocomplete="address-level1"
                class:input-error={$errors.address}
            />
            {#if $errors.address}
                <span class="error">{$errors.address}</span>
            {/if}
        </div>

        <div class="grid sm:grid-cols-4 md:grid-cols-5 gap-x-8">
            <div class="form-control w-full col-span-2">
                <label class="label" for="country">
                    <span class="label-text">Country</span>
                </label>
                <select 
                    name="country" 
                    id="country"
                    class="select select-bordered select-md"
                    bind:value={$form.country.id}
                    on:change={() => (getStates())}
                    class:input-error={$errors.country.id}
                >
                    <option value="" disabled>Select Country</option>
                    {#each countries as item }
                    <option value={item.id}>
                        { item.name }
                    </option>  
                    {/each}
                </select>
                {#if $errors.country.id}
                    <span class="error">{$errors.country.id}</span>
                {/if}
            </div>
            <div class="form-control w-full col-span-2">
                <label class="label" for="state">
                    <span class="label-text">State</span>
                </label>
                <select 
                    name="state" 
                    id="state"
                    class="select select-bordered select-md"
                    bind:value={$form.state.id}
                    class:input-error={$errors.state.id}
                >
                    <option value="" disabled>Select State</option>
                    {#each states as item }
                    <option value={item.id}>
                        { item.name }
                    </option>  
                    {/each}
                </select>
                {#if $errors.state.id}
                    <span class="error">{$errors.state.id}</span>
                {/if}
            </div>
            
            <div class="form-control w-full sm:col-span-2">
                <label class="label" for="zip">
                    <span class="label-text">Zip code</span>
                </label>
                <input
                    type="text"
                    name="zip"
                    id="zip"
                    placeholder="Zip code"
                    bind:value={$form.zip}
                    class="input input-bordered input-md"
                    class:input-error={$errors.zip}
                />
                {#if $errors.zip}
                    <span class="error">{$errors.zip}</span>
                {/if}
            </div>
        </div>

        <div class="mt-4">
            <button class="btn btn-primary min-w-[200px]" type="submit" class:btn-disabled={isLoading}>
                <span class="loading loading-spinner" class:hidden={!isLoading}></span>
                Update Profile
            </button>
        </div>
    
    </form>
</div>