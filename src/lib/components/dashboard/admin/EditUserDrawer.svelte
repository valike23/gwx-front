<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { Button, Checkbox, Helper, Input, Label, Spinner, Select } from "flowbite-svelte";
    import { clientFetch, axiosFetch } from "$lib/client/api";
    import { createEventDispatcher, onMount } from "svelte";
    import { failure, success } from "$lib/utils/toast";
    
    export let data;
    let countries = [];
    let states = [];
    let hubs = [];
    let regions = [];
    const dispatch = createEventDispatcher();

    let isLoading = false, obscureText = false;

    const { form, errors, handleSubmit, handleReset } = createForm({
        initialValues: {
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            password: "",
            checked: false,
        },
        validationSchema: yup.object().shape({
            email: yup.string().email().required().label("Email"),
            name: yup.string().required().label("Name"),
            phone: yup.string().optional().label("Phone"),
            password: yup.string().min(8).nullable().optional().label("Password"),
            checked: yup.bool(),
        }),
        async onSubmit(values) {
            isLoading = false;

            try {
                let res = await clientFetch({
                    path: "users/" + data.id,
                    method: "PUT",
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("User updated sucessfully");
                handleReset();
                dispatch('close', true);
            } catch (error) {
                failure(error);
            } finally {
                isLoading = false
            }
        }

        
    })
    function getStates() {
        const country = $form.country?.id;
        let q = new URLSearchParams({
            country_id: $form.country?.id,
            limit: 1000,
        }).toString();
        axiosFetch.get(`/countries/${country}/states`).then((res) => {
            states = res.data.data;
        });
    }
    function getHubs() {
        axiosFetch.get(`hubs/${$form.state?.id}/state`).then((res) => {
           hubs = res.data.results;
           hubs = hubs;
        });
    }

    const  loadRegion = async ()=>{
        try {
            const res = await clientFetch({
                path: `/zone/${$form.country.id}`
            });
            const json = await res.json();
            if (!res.ok) throw json;
            const {data} = json
            regions = data;
            regions = regions;
        } catch (error) {
            console.log(error);
        }
    }
    function getCountries() {
        axiosFetch
            .get("/countries")
            .then((res) => {
                countries = res.data.data;
            })
            .finally(() => {
                if ($form.country?.id && !states.length) {
                    getStates();
                }
            });
    }

    onMount(async ()=>{
      await  getCountries();
    })
</script>

<div>
    <form on:submit={handleSubmit}>
        <div class="form-control">
            <Label for="name" class="mb-2 font-normal">Name:</Label>
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
        <div class="form-control">
            <Label for="country" class="mb-2 font-normal">Country</Label>
            <Select bind:value={$form.country} on:change={() =>{ getStates(); loadRegion();}} id="hub">
                {#each countries as country}
                <option value="{country}">{country.name}</option>
                {/each}
            </Select>
        </div>

        <div class="form-control">
            <Label for="states" class="mb-2 font-normal">State</Label>
            <Select bind:value={$form.state} on:change={() => getHubs()} id="states">
                {#each states as state}
                <option value="{state}">{state.name}</option>
                {/each}
            </Select>
        </div>
      
        {#if data.role == 'courier' || data.role == 'manager'}
        <div class="form-control">
            <Label for="hub" class="mb-2 font-normal">Hub</Label>
            <Select bind:value={$form.hub_id} id="hub">
                {#each hubs as hub}
                <option value="{hub.id}">{hub.name}</option>
                {/each}
            </Select>
           
        </div> 
        {/if}

        {#if data.role == 'regionalmanager' }
        <div class="form-control">
            <Label for="region" class="mb-2 font-normal">Region</Label>
            <Select bind:value={$form.zone_id} id="region">
                {#each regions as region}
                <option value="{region.id}">{region.name}</option>
                {/each}
            </Select>
           
        </div>
        {/if}
       
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
            <Label for="phone" class="mb-2 font-normal">Password:</Label>
            <Input 
                type={obscureText ? "password" : "text"}
                id="phone" 
                bind:value={$form.password}
                placeholder="Enter new password" 
                color="{$errors.password ? 'red' : 'base'}" 
            />
            {#if $errors.password}
            <Helper class="mt-2" color="red">
                <span class="font-medium">Oh, snapp! </span>
                { $errors.password }
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Checkbox 
                bind:checked={$form.checked}
                class="font-normal text-xs text-base-content/70">
                I agree to the above changes made.
            </Checkbox>
        </div>
        <div class="fomr-control mt-4">
            <Button type="submit" size="lg" class="w-full" disabled={isLoading || !$form.checked}>
                {#if isLoading}
                <Spinner class="mr-3" size="4" color="white" />
                {/if}
                Submit
            </Button>
        </div> 
    </form>
</div>