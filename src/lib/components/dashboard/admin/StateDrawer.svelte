<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { Button, Label, Input, Helper, Spinner, Select, CloseButton } from "flowbite-svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { failure, success } from "$lib/utils/toast";
    import { axiosFetch, clientFetch } from "$lib/client/api";
    import { UilCancel, UilTimes } from "svelte-unicons";
    import { gwxRegions } from "$lib/data/geo";
    import { page } from '$app/stores';

    export let data;
    let isLoading = false;
    let submit = false;
    let countries = [];
    let regions = [];

    const dispatch = createEventDispatcher();

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

    onMount(() => {
        $form.country= $page.url.searchParams.get("country_id") || "";
        if (data) {
            $form = Object.assign($form, {
                code: data.code || "",
                name: data.name || "",
                region: data.region || "",
                cities: data.cities || [],
                country_id: data.country.id
            })
        }

        getCountries();
        if($form.country.has_regions){ 
            loadRegion();
        
        }
    })

    const handleUpload = async ()=>{
        console.log("the values tremp", $form);
           

            isLoading = true;
            try {
                let res = await clientFetch({
                    method: data ? "PUT" : "POST",
                    path: `/states${data ? '/' + data.id : ''}`,
                    body: $form
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("Operation sucessful");
                handleReset();
                dispatch('close', true);

            } catch (error) {
                console.log(error);
                failure(error);
            } finally {
                isLoading = false;
                return;
            }
    }

    const { form, errors, handleReset, handleSubmit } = createForm({
       
        initialValues: {
            name: "",
            code: "",
            region: "",
            cities: [],
            country: {},
        },
        validationSchema: yup.object().shape({
            code: yup.string().min(2).required().label("Code"),
            name: yup.string().min(2).required().label("Name"),
            region: yup.string().label("Region"),
            country: yup
                .object()
                .shape({
                    id: yup.string(),
                    code: yup.string(),
                    name: yup.string(),
                })
                .label("Country"),
            cities: yup.array().of(yup.string())
                .test(
                    'unique',
                    'Only unique values allowed',
                    (value) => value ? value.length == new Set(value)?.size : true
                ).label("Cities"),
        }),
        async onSubmit(values) {
            console.log("the values", values);
            if (!submit) {
                return;
            };

            isLoading = true;

            try {
                let res = await clientFetch({
                    method: data ? "PUT" : "POST",
                    path: `/states${data ? '/' + data.id : ''}`,
                    body: values
                });

                const json = await res.json();
                if (!res.ok) throw json;

                success("Operation sucessful");
                handleReset();
                dispatch('close', true);

            } catch (error) {
                console.log('the error here is',error);
                failure(error);
            } finally {
                isLoading = false;
                return;
            }
        }
    });

    function onKeyUp(e) {
        if (e.code == "Enter") {
            e.preventDefault();
            submit = false;

            let val = e.target.value;
            if (val.length >= 2) {
                let r = $form.cities;
                r.push(val);
                $form.cities = Array.from(new Set(r.sort()));
                e.target.value = "";
            } 
        }
        submit = false;
    }

    function getCountries() {
        axiosFetch.get("/countries")
        .then(res => {
            countries = res.data.data;
        });
    }

</script>
<div>
    <div class="flex justify-between items-center">
        <h2> </h2>
        <CloseButton on:click={() => (dispatch('close'))}/>
    </div>
    <form on:submit|preventDefault={handleUpload} class="pt-6">
        <div class="form-control">
            <Label for="code" class="mb-2 font-normal">Code</Label>
            <Input
                type="text"
                id="code"
                bind:value={$form.code}
                required
                placeholder="Enter code"
                olor="{$errors.code ? 'red' : 'base'}" 
            />
            {#if $errors.code }
            <Helper color="red" class="mt-2">
                <strong>Oops! </strong>
                <span>{ $errors.code }</span>
            </Helper>
            {/if}
        </div>
        <div class="form-control">
            <Label for="name" class="mb-2 font-normal">Name</Label>
            <Input
                type="text"
                id="name"
                required
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
        <div class="form-control" class:hidden={!!data}>
            <Label for="country" class="mb-2 font-normal">Country</Label>
            <Select 
                id="region"
                required
                bind:value={$form.country}
                on:change={loadRegion}
                items={countries.map(e => ({value: e, name: e.name}))}
                placeholder="Select country"
            />
            {#if $errors.country.id }
            <Helper color="red" class="mt-2">
                <strong>Oops! </strong>
                <span>{ $errors.country.id }</span>
            </Helper>
            {/if}
        </div>

        <div class="form-control">
            <Label for="region" class="mb-2 font-normal">Region</Label>
            <Select 
                id="region"
                disabled={!$form.country.has_regions}
                bind:value={$form.region}
                items={regions.map(e => ({value: e.code, name: e.name}))}
                placeholder="Select region"
            />
        </div>

     

        <div class="form-control">
            <Label class="mb-2">Cities</Label>
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 flex gap-2 flex-wrap">
                {#each $form.cities as c, index}
                <button 
                    type="button"
                    class="flex px-2 py-1 rounded-lg space-x-2 bg-base-100 text-xs items-center hover:bg-accent/5 transition-all"
                    on:click={() => {
                        let arr = $form.cities;
                        arr.splice(index, 1);
                        $form.cities = arr.sort();
                    }}
                >
                    <span>{ c }</span>
                    <span><UilTimes size="12"/></span>
                </button>
                {/each}
                <input
                    type="text"
                    class="rounded-lg border border-primary-500 px-3 text-xs py-2 w-full"
                    placeholder="Enter city"
                    on:keyup|preventDefault={onKeyUp}
                    pre
                />
            </div>
        </div>
        
        <div class="fomr-control mt-4">
            <Button type="submit" size="lg" class="w-full" disabled={isLoading} >
                {#if isLoading}
                <Spinner class="mr-3" size="4" color="white" />
                {/if}
                Submit
            </Button>
        </div>
    </form>
</div>