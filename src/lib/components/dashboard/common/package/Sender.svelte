<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { UilArrowRight, UilSearch, UilTimes, UilUser } from "svelte-unicons";
    import { createEventDispatcher, onMount } from "svelte";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { page } from "$app/stores";
    import { clickOutside, debounce, getJSON } from "$lib/utils/helpers";
    import { Input } from "flowbite-svelte";
    import { user } from "$lib/stores/user";
    
    export let formData;
    export let showBackButton = false;

    export const update = (data) => {
        $form = Object.assign($form, data);

        getStates();
    }

    const dispatch = createEventDispatcher();
    let users = [];
    let countries = [];
    let states = [];
    

    onMount(() => {

        let user = $page.data.session.user;

        if (user.role == "customer" && !$form.name) {
            $form.name = user.name;
            $form.email = user.email;
            $form.phone = user.phone;
            $form.address = user.address;
            $form.country = {
                name: user.country
            };
            $form.state = {
                name: user.state
            }
            $form.city = user.city || "";
            $form.zip = user.zip || "";
        }


        // get countries
        getCountries();  
        
        formData.subscribe(val => {
            let s = $form.state?.name;
            debounce(() => {
                $form = Object.assign($form, val.sender);

                if (countries.length && val.sender.country) {
                    $form.country = countries.find(e => e.name == val.sender.country.name) || {};

                    if (s != val.sender.state) {
                        getStates();
                    }
                }

                
            }, 500);
        })
    })

    const { form, errors, handleSubmit } = createForm({
        initialValues: Object.assign({country: {}, state: {}},  $formData.sender),
        validationSchema: yup.object().shape({
            name: yup.string().min(2).required().label("Full name"),
            email: yup.string().email().optional().label("Email"),
            phone: yup.string().required().label("Phone"),
            address: yup.string().required().label("Address"),
            state: yup.object().shape({
                id: yup.string().required().label("State"),
                code: yup.string(),
                name: yup.string()
            }).label("State"),
            country: yup.object().shape({
                id: yup.string().required().label("Country"),
                code: yup.string(),
                name: yup.string()
            }).label("Country"),
            // city: yup.string().label("City").default(""),
            // zip: yup.string().label("Zip").default(""),
        }),
        async onSubmit(values) {
            $formData = Object.assign($formData, {sender: values});
            dispatch("index", 1);
        },
    });

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        }).finally(() => {

            // if country name
            if ($form.country.name && !$form.country?.id) {
                let c = countries.find(e => e.name == $form.country.name);
                if (c) {
                    $form.country = {
                        id: c.id,
                        code: c.code,
                        name: c.name
                    }
                }
            }

            // populate country
            if (!$form.country.id) {
                let c = countries.find(e => e.name == "Nigeria");
                if (c) {
                    $form.country = {
                        id: c.id,
                        code: c.code,
                        name: c.name
                    }
                }
            }

            if ($form.country && !states.length) {
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
            if ($form.state.id) {
                let s = states.find(e => e.id == $form.state.id);
                if (!s) return;
                $form.state.name = s.name;
                $form.state.id = s.id;
            }
        });
    }

    function getCustomers(e) {
        clientFetch({
            path: "/users",
            query: {
                limit: 5,
                role: "customer",
                search: e.target.value,
                full: true
            }
        })
        .then(res => res.json())
        .then(json => {
            if (!json.data) return;
            users = json.data;
        });
    }

    function onSelectUser(user) {
        $formData.customer_id = user.id;
        $form = Object.assign($form, {
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            country: getJSON(user.country) || {},
            state: getJSON(user.state) || {},
            city: user.city,
            zip: user.zip
        });
        users = [];
    }
</script>

<div class="w-full">
    {#if showBackButton}
    <button 
        class="btn btn-circle btn-primary btn-sm bg-primary/5 text-primary hover:bg-primary/30 border-none"
        on:click={() => dispatch("index", 1)}
    >
        <span><UilTimes size="20" /></span>
    </button>
    {/if}

    <div class="relative mb-6" class:hidden={$page.data.session.user && $page.data.session.user.role == "customer"}>
        <div class="w-72 relative">
            <Input
                placeholder="Search customers"
                class="input input-md input-bordered rounded-lg placeholder:text-sm w-full"
                on:keyup={(e) => (debounce(() => getCustomers(e), 400))}
            >
                <span slot="left" class="text-primary"><UilSearch size="18" /></span>
            </Input>
            <div
                use:clickOutside={() => {
                    users = [];
                }} 
                class="absolute w-full top-12 bg-base-100 shadow-md divide-y rounded-md z-20">
                {#each users as user }
                <button 
                    on:click={() => (onSelectUser(user))}
                    class="flex w-full gap-x-3 px-3 py-4 items-center hover:bg-slate-50 transition-all">
                    <div class="grid place-content-center w-10 h-10 bg-slate-50 rounded-full text-base-content/40">
                        <UilUser size="15" />
                    </div>
                    <div class="flex-1 text-left text-sm">
                        <div>{ user.name }</div>
                        <div class="text-gray-400 text-xs">{ user.email || user.phone || "" }</div>
                    </div>
                </button>
                {/each}
            </div>
        </div>
    </div>

    <form on:submit={handleSubmit} class="py-3">
        <div class="grid sm:grid-cols-2 gap-8">
            <div class="form-control w-full">
                <label class="label" for="name">
                    <span class="label-text">Name*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Sender name"
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
                <label class="label" for="email">
                    <span class="label-text">Email</span>
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Sender email address"
                    bind:value={$form.email}
                    class="input input-bordered input-md"
                    class:input-error={$errors.email}
                />
                {#if $errors.email}
                    <span class="error">{$errors.email}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="phone">
                    <span class="label-text">Phone number*</span>
                </label>
                <input
                    type="tel"
                    name="phone"
                    id="phone"
                    placeholder="234801234567"
                    bind:value={$form.phone}
                    class="input input-bordered input-md"
                    class:input-error={$errors.phone}
                />
                {#if $errors.phone}
                    <span class="error">{$errors.phone}</span>
                {/if}
            </div>
        </div>
    
        <div class="form-control w-full">
            <label class="label" for="address">
                <span class="label-text">Address*</span>
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

        <div class="grid grid-cols-2 gap-x-8">
            <div class="form-control w-full">
                <label class="label" for="state">
                    <span class="label-text">State*</span>
                </label>
                <select 
                    name="state" 
                    id="state"
                    class="select select-bordered select-md"
                    bind:value={$form.state.id}
                    class:input-error={$errors.state.id}
                    on:change={() => {
                        let s = states.find(e => e.id == $form.state.id);
                        if (!s) return;
                        $form.state.name = s.name;
                        $form.state.id = s.id;
                    }}
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
            <div class="form-control w-full">
                <label class="label" for="country">
                    <span class="label-text">Country*</span>
                </label>
                <select 
                    name="country" 
                    id="country"
                    class="select select-bordered select-md"
                    bind:value={$form.country.id}
                    on:change={() => (getStates())}
                    class:input-error={$errors.country}
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
            
        </div>

        <div class="mt-4 text-center">
            <button class="btn btn-primary min-w-[200px]">
                Proceed
            </button>
        </div>
    </form>
</div>