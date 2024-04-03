<script>
    import * as yup from "yup";
    import { createForm } from "svelte-forms-lib";
    import { UilAngleLeft, UilArrowLeft, UilArrowRight, UilTimes } from "svelte-unicons";
    import { createEventDispatcher } from "svelte";
    
    export let formData;
    export let showBackButton = false;

    const dispatch = createEventDispatcher();

    const { form, errors, handleSubmit } = createForm({
        initialValues: Object.assign({dimensions: {}}, $formData),
        validationSchema: yup.object().shape({
            name: yup.string().required().label("Item name"),
            description: yup.string().label("Item description"),
            weight: yup.string().required().label("Weight"),
            value: yup.string().required().label("Item value"),
            quantity: yup.number().required().label("Item value"),
            dimensions: yup.object().shape({
                width: yup.string(),
                heigth: yup.string(),
                length: yup.string()
            }),
            shipping: yup.object().shape({
                subtotal: yup.string()
            }).optional()
        }),
        async onSubmit(values) {
            $formData = Object.assign($formData, values);
            dispatch("index", 3);
        },
    });
</script>

<div>
    <button 
        class="btn btn-circle btn-primary btn-sm bg-primary/5 text-primary hover:bg-primary/30 border-none"
        on:click={() => dispatch("index", 1)}
    >
        <span>
            <svelte:component this={showBackButton ? UilTimes : UilAngleLeft} size="20" />
        </span>
    </button>

    <div class="mb-3 hidden">
        <p class="text-base-content/60">Shipment information</p>
    </div>

    <form on:submit={handleSubmit} class="py-3">
        <div class="form-control w-full">
            <label class="label" for="name">
                <span class="label-text">Package Name</span>
            </label>
            <input
                type="text"
                name="name"
                id="name"
                placeholder="Package name"
                bind:value={$form.name}
                class="input input-bordered input-md"
                class:input-error={$errors.name}
            />
            {#if $errors.name}
                <span class="error">{$errors.name}</span>
            {/if}
        </div>
        <div class="form-control w-full">
            <label class="label" for="description">
                <span class="label-text">Package Description</span>
            </label>
            <textarea 
                id="description"
                name="description"
                class="textarea textarea-bordered textarea-error"
                placeholder="Package description"
                bind:value={$form.description}
                rows="2"
                class:textarea-error={$errors.description}
                
            />
            {#if $errors.description}
                <span class="error">{$errors.description}</span>
            {/if}
        </div>
        <div class="grid grid-cols-2 gap-x-8">
            <div class="form-control w-full">
                <label class="label" for="value">
                    <span class="label-text">Package value</span>
                </label>
                <input
                    type="text"
                    name="text"
                    id="value"
                    placeholder="Item value"
                    bind:value={$form.value}
                    class="input input-bordered input-md"
                    class:input-error={$errors.value}
                />
                {#if $errors.value}
                    <span class="error">{$errors.value}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="weight">
                    <span class="label-text">Weight (kg)</span>
                </label>
                <input
                    type="text"
                    name="weight"
                    id="weight"
                    placeholder="Item weight in kg"
                    bind:value={$form.weight}
                    class="input input-bordered input-md w-full"
                    class:input-error={$errors.weight}
                />
                {#if $errors.weight}
                    <span class="error">{$errors.weight}</span>
                {/if}
            </div>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-8">
            <div class="form-control w-full">
                <label class="label" for="length">
                    <span class="label-text">Length</span>
                </label>
                <input
                    type="number"
                    name="length"
                    id="length"
                    placeholder="Item length"
                    bind:value={$form.dimensions.length}
                    class="input input-bordered input-md w-full"
                    class:input-error={$errors.dimensions.length}
                />
                {#if $errors.dimensions.length}
                    <span class="error">{$errors.dimensions.length}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="width">
                    <span class="label-text">Width</span>
                </label>
                <input
                    type="number"
                    name="width"
                    id="width"
                    placeholder="Item width"
                    bind:value={$form.dimensions.width}
                    class="input input-bordered input-md w-full"
                    class:input-error={$errors.dimensions.width}
                />
                {#if $errors.dimensions.width}
                    <span class="error">{$errors.dimensions.width}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="height">
                    <span class="label-text">Height</span>
                </label>
                <input
                    type="number"
                    name="height"
                    id="height"
                    placeholder="Item height"
                    bind:value={$form.dimensions.height}
                    class="input input-bordered input-md w-full"
                    class:input-error={$errors.dimensions.height}
                />
                {#if $errors.dimensions.height}
                    <span class="error">{$errors.dimensions.height}</span>
                {/if}
            </div>
            <div class="form-control w-full">
                <label class="label" for="quantity">
                    <span class="label-text">Quantity</span>
                </label>
                <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    placeholder="Item quantity"
                    bind:value={$form.quantity}
                    class="input input-bordered input-md w-full"
                    class:input-error={$errors.quantity}
                />
                {#if $errors.quantity}
                    <span class="error">{$errors.quantity}</span>
                {/if}
            </div>
        </div>
    
        <div class="flex mt-4">
            <button class="btn btn-primary min-w-[200px]">
                Continue
            </button>
        </div>
    </form>
</div>