<script>
    import { Alert, CloseButton } from "flowbite-svelte";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { UilInfoCircle } from 'svelte-unicons';
    import { failure, success } from '$lib/utils/toast';
    import { clientFetch } from '$lib/client/api';

    const dispatch = createEventDispatcher();

    export let id;

    let isLoading = false;
    const reasons = [
        "Wrong Delivery Address",
        "Consignee Completely Unreachable",
        "Consignee Refuses Delivery",
        "Unable to Locate Address",
        "Delivery Address Unsafe",
        "Out of Delivery Time",
        "Consignee not taking call",
        "Parcel Damaged on Arrival",
    ];


    let body = {
        reason: reasons[0]
    }

    onMount(() => {
        
    });

    async function doSubmit() {
        
        // TODO: Add ability to save request offline. Check for internet connection

        if (!body.reason) {
            failure("You must select or enter a reason");
            return;
        }

        try {
            const res = await clientFetch({
                path: `/deliveries/${id}/cancel`,
                method: "POST",
                body
            });
            const json = await res.json();
            if (!res.ok) throw json;
            success("Delivery canceled successfully");
            dispatch('cancel');
        } catch (error) {
            failure(error);
        } finally {
            isLoading = false;
        }
    }

</script>

<div class="w-full h-full bg-base-100 relative z-50 overflow-y-auto scrollbar-hide">

    <div class="flex gap-x-4 sticky bg-base-100 shadow-sm w-full top-0 px-4 items-center h-14">
        <div><CloseButton on:click={() => (dispatch('close'))} /></div>
        <h3 class="font-medium text-error">Return Delivery</h3>
    </div>

    <div class="px-8">
        <div class="py-2 font-medium mt-2">Select reason:</div>
        <div class="mt-2">
            {#each reasons as item, index }
            <div class="form-control z-0">
                <label class="label cursor-pointer">
                    <span class="label-text">{item}</span> 
                    <input 
                        type="radio" 
                        name="reason" 
                        class="radio radio-sm checked:bg-red-500 bg-slate-100 border-none" 
                        on:change={() => (body.reason = item)} 
                        checked={item == body.reason}
                    />
                </label>
            </div>
            {/each}
            <div class="form-control">
                <label class="label cursor-pointer">
                    <span class="label-text">Other</span> 
                    <input 
                        type="radio" 
                        name="reason" 
                        on:change={() => (body.reason = null)} 
                        class="radio radio-sm  checked:bg-red-500"
                    />
                </label>
            </div>
            {#if !reasons.includes(body.reason)}
            <div 
                class="form-control"
            >
                <textarea 
                    name="" 
                    id="" 
                    class="textarea textarea-sm textarea-bordered" 
                    rows="2"
                    placeholder="Enter reason"
                    bind:value={body.reason}
                />
            </div>
            {/if}
            
        </div>

        <div class="mt-8 mb-4">
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