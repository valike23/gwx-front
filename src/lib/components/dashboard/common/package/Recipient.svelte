<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { UilAngleLeft, UilTimes } from "svelte-unicons";
    import { createEventDispatcher, onMount } from "svelte";
    import { axiosFetch } from "$lib/client/api";
    
    export let formData;
    export let showBackButton = false;

    const dispatch = createEventDispatcher();

    let countries = [];
    let states = [];

    onMount(() => {
        // get countries
        getCountries();
    })

    const { form, errors, handleSubmit } = createForm({
        initialValues: Object.assign({country: {}, state: {}},  $formData.recipient),
        validationSchema: yup.object().shape({
            name: yup.string().min(2).required().label("Full name"),
            email: yup.string().email().optional().label("Email"),
            phone: yup.string().required().label("Phone"),
            alternate_phone: yup.string().optional().label("Phone 2"),
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
        }),
        async onSubmit(values) {
            $formData = Object.assign($formData, {recipient: values});
            dispatch("index", 2);
        },
    });

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        }).finally(() => {
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
            states = res.data.data;
            if ($form.state.id) {
                let s = states.find(e => e.id == $form.state.id);
                if (!s) return;
                $form.state.name = s.name;
                $form.state.id = s.id;
            }
        });
    }
</script>

<div class="w-full">

    <button 
        class="btn btn-circle btn-primary btn-sm bg-primary/5 text-primary hover:bg-primary/30 border-none"
        on:click={() => dispatch("index", 0)}
    >
        <span>
            <svelte:component this={showBackButton ? UilTimes : UilAngleLeft} size="20" />
        </span>
    </button>

    <div class="mb-3">
        <p class="text-base-content/60 hidden">Recipient's information</p>
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
                    placeholder="Recipient name"
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
                    placeholder="Recipient email address"
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
            <div class="form-control w-full">
                <label class="label" for="alternate-phone">
                    <span class="label-text">Alternate Phone number</span>
                </label>
                <input
                    type="tel"
                    name="alternate-phone"
                    id="alternate-phone"
                    placeholder="234801234567"
                    bind:value={$form.alternate_phone}
                    class="input input-bordered input-md"
                    class:input-error={$errors.alternate_phone}
                />
                {#if $errors.alternate_phone}
                    <span class="error">{$errors.alternate_phone}</span>
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