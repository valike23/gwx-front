<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { UilAngleLeft, UilTimes } from "svelte-unicons";
    import { createEventDispatcher, onMount } from "svelte";
    import { Select, Helper } from "flowbite-svelte";
    import { clientFetch } from "$lib/client/api";
    
    export let formData;
    export let showBackButton = false;

    const dispatch = createEventDispatcher();
    let hubs = [];

    onMount(() => {
        getHubs();

        $form = Object.assign({}, $form, $formData);
    })

    const { form, errors, handleSubmit } = createForm({
        initialValues: {
            waybill_number: "",
            hub: {
                id: "",
                name: ""
            },
            billing: {
                amount: "0.00",
                extra: "0.00",
                discount: "0.00",
                vat: "0.00",
            }
        },
        validationSchema: yup.object().shape({
            waybill_number: yup.string(),
            hub: yup.object().shape({
                id: yup.string().required().label("Hub"),
                name: yup.string()
            }).required(),
            billing: yup.object().shape({
                amount: yup.string().transform(e => `${e}`).required().label("Amount"),
                extra: yup.string().transform(e => `${e}`).required().label("Extra charges"),
                discount: yup.string().transform(e => `${e}`),
                vat: yup.string().transform(e => `${e}`)
            }).required()
        }).strip(),
        async onSubmit(values) {
            $formData = Object.assign($formData, values);
            dispatch("index", 4);
        },
    });

    function getHubs() {
        clientFetch({
            path: "/hubs",
            query: {
                state_id: $formData.sender?.state?.id || ""
            }
        })
        .then(res => res.json())
        .then(json => {
            hubs = json.data;
        })
    }
</script>

<div class="w-full">
    <button 
        class="btn btn-circle btn-primary btn-sm bg-primary/5 text-primary hover:bg-primary/30 border-none"
        on:click={() => dispatch("index", 2)}
    >
        <span>
            <svelte:component this={showBackButton ? UilTimes : UilAngleLeft} size="20" />
        </span>
    </button>

    <form on:submit={handleSubmit} class="py-3">
        <div class="my-5">
            <p class="text-sm uppercase font-medium">Shipment detail</p>
        </div>
    
        <div class="grid sm:grid-cols-2 gap-8">
            <div class="form-control w-full">
                <label class="label" for="waybill">
                    <span class="label-text">Waybill Number</span>
                    <span class="label-text-alt text-info">Auto generated</span>
                </label>
                <input
                    type="text"
                    name="waybill"
                    id="waybill"
                    placeholder="Waybill number"
                    bind:value={$form.waybill_number}
                    class="input input-md input-bordered"
                    class:input-error={$errors.waybill_number}
                />
                {#if $errors.waybill_number}
                    <span class="error">{$errors.waybill_number}</span>
                {/if}
            </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-8">
            <div class="form-control w-full">
                <label class="label" for="hub">
                    <span class="label-text">Origin Hub</span>
                </label>
                <Select 
                    id="hub"
                    bind:value={$form.hub.id}
                    items={hubs.map(e => ({value: e.id, name: e.name}))}
                    placeholder="Select hub"
                    on:input={(e) => {
                        $form.hub.name = hubs.find(h => h.id == e.target.value)?.name
                    }}
                />
                {#if $errors.hub.id }
                <Helper color="red" class="mt-2">
                    <strong>Oops! </strong>
                    <span>{ $errors.hub.id }</span>
                </Helper>
                {/if}
            </div>
        </div>
        <div class="divider" />
        <div class="my-5">
            <p class="text-sm uppercase font-medium">Billing detail</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-x-8">
            <div class="form-control w-full">
                <label class="label" for="amount">
                    <span class="label-text">Amount</span>
                </label>
                <input
                    type="number"
                    name="amount"
                    id="amount"
                    placeholder="0.00"
                    bind:value={$form.billing.amount}
                    class="input input-md input-bordered"
                    class:input-error={$errors.billing.amount}
                />
                {#if $errors.billing.amount}
                    <span class="error">{$errors.billing.amount}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="extra">
                    <span class="label-text">Extra Charges</span>
                </label>
                <input
                    type="number"
                    name="extra"
                    id="extra"
                    min="0"
                    placeholder="0.00"
                    bind:value={$form.billing.extra}
                    class="input input-md input-bordered"
                    class:input-error={$errors.billing.extra}
                />
                {#if $errors.billing.extra}
                    <span class="error">{$errors.billing.extra}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="discount">
                    <span class="label-text">Discount</span>
                </label>
                <input
                    type="number"
                    name="discount"
                    id="discount"
                    placeholder="0.00"
                    bind:value={$form.billing.discount}
                    class="input input-md input-bordered"
                    class:input-error={$errors.billing.discount}
                />
                {#if $errors.billing.discount}
                    <span class="error">{$errors.billing.discount}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="vat">
                    <span class="label-text">VAT Charges</span>
                </label>
                <input
                    type="number"
                    name="vat"
                    id="vat"
                    placeholder="0.00"
                    bind:value={$form.billing.vat}
                    class="input input-md input-bordered"
                    class:input-error={$errors.billing.vat}
                />
                {#if $errors.billing.vat}
                    <span class="error">{$errors.billing.vat}</span>
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