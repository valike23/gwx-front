<script>
    import SignaturePad from 'signature_pad';
    import { Alert, CloseButton, Input, Label } from "flowbite-svelte";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { UilEditAlt, UilHouseUser, UilLock } from 'svelte-unicons';
    import { failure, success } from '$lib/utils/toast';
    import { clientFetch } from '$lib/client/api';

    const dispatch = createEventDispatcher();

    export let id;
    export let consignee;

    let canvas;
    let isLoading = false;
    let disableInput = true;

    /**@type {SignaturePad} */
    let signaturePad;

    let body = {
        consignee
    }

    onMount(() => {
        signaturePad = new SignaturePad(canvas, {})
    });

    onDestroy(() => {
        signaturePad.off();
        signaturePad = null;
    })

    async function doSubmit() {
        
        if (!body.signature) {
            failure("You must add a signature to complete delivery");
            return;
        }

        // TODO: Add ability to save request offline. Check for internet connection

        try {
            const res = await clientFetch({
                path: `/deliveries/${id}/confirm`,
                method: "POST",
                body
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success("Delivery completed successfully");
            dispatch('success');
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

    function saveSignature() {
        body.signature = signaturePad.toDataURL("image/png", {
            includeBackgroundColor: false
        });
    }

</script>

<div class="w-full h-full bg-base-100 relative z-50 overflow-y-auto">

    <div class="flex gap-x-4 sticky bg-base-100 shadow-sm w-full top-0 px-4 items-center h-14">
        <div><CloseButton on:click={() => (dispatch('close'))} /></div>
        <h3 class="font-medium text-primary">Confirm Delivery</h3>
    </div>

    <div class="p-8">
        <!-- <Alert color="blue">
            <UilInfoCircle slot="icon" size="18"/>
            <p class="text-xs">Please ensure you confirm PIN before proceeding</p>
        </Alert> -->

        <div class="form-control">
            <Label class="mb-2">Consignee</Label>
            <Input
                bind:value={body.consignee}
                disabled={disableInput}
                class="py-3"
                >
                <span slot="left" class="text-base-content/40">
                    <UilHouseUser size="20" />
                </span>
                <button slot="right" class="btn btn-sm rounded-full btn-link pr-0" on:click={() => (disableInput = !disableInput)}>
                    <svelte:component this={disableInput ? UilEditAlt : UilLock} size="20" />
                </button>
            </Input>
        </div>


        <div class="py-2 font-medium text-sm mt-4">Apply signature here:</div>

        <canvas bind:this={canvas} id="canvas" class="w-full h-48 border rounded" />
        <div class="mt-3">
            <button class="btn btn-sm btn-primary" on:click={saveSignature}>
                Save
            </button>
            <button class="btn btn-sm" on:click={() => signaturePad.clear()}>
                Clear
            </button>
        </div>

        <div class="mt-8">
            <button 
                class="btn w-full btn-primary"
                type="submit" 
                class:btn-disabled={isLoading}
                on:click={doSubmit}
            >
                <span class="loading loading-spinner" class:hidden={!isLoading} />
                Done
            </button>
        </div>
        
    </div>
</div>